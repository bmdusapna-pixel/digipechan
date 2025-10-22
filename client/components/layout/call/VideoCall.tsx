"use client";
import React, { useEffect, useRef, useState } from "react";
import { Mic, MicOff, Video, VideoOff, PhoneOff, Repeat } from "lucide-react";
import { apiRequest } from "@/common/utils/apiClient";
import { AGORA_APP_ID, API_DOMAIN } from "@/common/constants/apiEndpoints";

interface VideoCallProps {
  channel: string;
  videoCallsAllowed: boolean | undefined;
  mediaType: "none" | "audio" | "video";
  setMediaType: (type: "none" | "audio" | "video") => void;
  qr: {
    _id: string;
    customerName?: string;
  };
}

interface RemoteUser {
  uid: string;
  videoTrack?: any;
  audioTrack?: any;
}

export default function VideoCall({
  channel,
  videoCallsAllowed,
  mediaType,
  setMediaType,
  qr,
}: VideoCallProps) {
  const clientRef = useRef<any>(null);
  const localAudioTrackRef = useRef<any>(null);
  const localVideoTrackRef = useRef<any>(null);
  const [AgoraRTC, setAgoraRTC] = useState<any>(null);

  const [joined, setJoined] = useState(false);
  const [muted, setMuted] = useState(false);
  const [videoOff, setVideoOff] = useState(false);
  const [remoteUsers, setRemoteUsers] = useState<RemoteUser[]>([]);
  const [time, setTime] = useState(60);

  // Load Agora dynamically
  useEffect(() => {
    if (typeof window !== "undefined") {
      import("agora-rtc-sdk-ng").then((mod) => setAgoraRTC(mod));
    }
  }, []);

  // Initialize client and handle remote users
  useEffect(() => {
    if (!AgoraRTC) return;

    const client = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });
    clientRef.current = client;

    const handleUserPublished = async (user: any, mediaType: string) => {
      await client.subscribe(user, mediaType);

      if (mediaType === "video" && user.videoTrack) {
        setRemoteUsers((prev) => [
          ...prev.filter((u) => u.uid !== user.uid),
          {
            uid: user.uid,
            videoTrack: user.videoTrack,
            audioTrack: user.audioTrack,
          },
        ]);
      }

      if (mediaType === "audio" && user.audioTrack) {
        user.audioTrack.play();
      }
    };

    const handleUserUnpublished = (user: any, type: string) => {
      if (type === "video") {
        setRemoteUsers((prev) => prev.filter((u) => u.uid !== user.uid));
      }
    };

    client.on("user-published", handleUserPublished);
    client.on("user-unpublished", handleUserUnpublished);

    return () => {
      if (joined) leaveChannel();
    };
  }, [AgoraRTC]);

  // Auto join if mediaType is not "none"
  useEffect(() => {
    if (AgoraRTC && mediaType !== "none" && !joined) {
      joinChannel().catch(console.error);
    }
  }, [AgoraRTC, mediaType]);

  // Auto-leave when all remote users leave
  useEffect(() => {
    if (remoteUsers.length > 0) {
      setTime(1);
    }
    if (joined && remoteUsers.length === 0) {
      const timer = setTimeout(() => {
        leaveChannel();
      }, time * 1000);

      return () => clearTimeout(timer);
    }
  }, [remoteUsers, joined]);

  const joinChannel = async () => {
    if (!AgoraRTC) return;

    const tokenResp = await apiRequest<{
      rtcToken: string;
      rtmToken: string;
      uid: string;
      channelName: string;
      notificationSent: boolean;
    }>("POST", `${API_DOMAIN}/token?channel=${channel}`, {
      qrId: qr._id,
      userName: qr.customerName || "Unknown User",
      mediaType: mediaType,
    });

    if (!tokenResp) throw new Error("Failed to fetch token");
    const { rtcToken, uid } = tokenResp;
    const client = clientRef.current;

    await client.join(AGORA_APP_ID, channel, rtcToken, uid);

    // Always create audio track if mediaType is audio or video
    localAudioTrackRef.current = await AgoraRTC.createMicrophoneAudioTrack();
    const publishTracks = [localAudioTrackRef.current];

    if (mediaType === "video") {
      localVideoTrackRef.current = await AgoraRTC.createCameraVideoTrack();
      publishTracks.push(localVideoTrackRef.current);
    }

    await client.publish(publishTracks);

    setJoined(true);
  };

  const leaveChannel = async () => {
    const client = clientRef.current;
    if (!client) return;

    if (localAudioTrackRef.current) {
      localAudioTrackRef.current.stop();
      localAudioTrackRef.current.close();
      localAudioTrackRef.current = null;
    }

    if (localVideoTrackRef.current) {
      localVideoTrackRef.current.stop();
      localVideoTrackRef.current.close();
      localVideoTrackRef.current = null;
    }

    await client.leave();
    setJoined(false);
    setRemoteUsers([]);
    setMediaType("none");
  };

  const toggleMute = () => {
    if (!localAudioTrackRef.current) return;
    localAudioTrackRef.current.setEnabled(muted);
    setMuted(!muted);
  };

  const toggleVideo = () => {
    if (!localVideoTrackRef.current) return;
    localVideoTrackRef.current.setEnabled(videoOff);
    setVideoOff(!videoOff);
  };

  const switchMediaMode = async () => {
    if (!joined || !AgoraRTC) return;
    const client = clientRef.current;

    if (mediaType === "video") {
      // Switch to audio only
      if (localVideoTrackRef.current) {
        await client.unpublish(localVideoTrackRef.current);
        localVideoTrackRef.current.stop();
        localVideoTrackRef.current.close();
        localVideoTrackRef.current = null;
      }
      setMediaType("audio");
    } else {
      // Switch to video + audio
      if (!localAudioTrackRef.current) {
        localAudioTrackRef.current =
          await AgoraRTC.createMicrophoneAudioTrack();
        await client.publish([localAudioTrackRef.current]);
      }
      localVideoTrackRef.current = await AgoraRTC.createCameraVideoTrack();
      await client.publish(localVideoTrackRef.current);
      setMediaType("video");
    }
  };

  return (
    <div className="relative w-full h-screen bg-black flex flex-col items-center justify-center">
      <div className="flex justify-center items-center w-full h-full max-w-5xl relative">
        {/* Remote User Video */}
        {remoteUsers.map((user) => (
          <div
            key={user.uid}
            className="absolute top-0 left-0 w-full h-full rounded-xl overflow-hidden"
            ref={(el) => {
              if (el && user.videoTrack && !el.hasChildNodes()) {
                user.videoTrack.play(el);
              }
            }}
          />
        ))}

        {/* Local Video (Main or Preview) */}
        {mediaType === "video" && localVideoTrackRef.current && (
          <div
            ref={(el) => {
              if (el && localVideoTrackRef.current && !el.hasChildNodes()) {
                localVideoTrackRef.current.play(el, { muted: true });
                const video = el.querySelector("video");
                if (video) {
                  video.setAttribute("playsinline", "");
                  video.setAttribute("muted", "");
                }
              }
            }}
            className={`${
              remoteUsers.length > 0
                ? "absolute top-32 right-6 w-48 h-32 rounded-lg shadow-lg"
                : "w-full h-full rounded-xl overflow-hidden"
            }`}
          />
        )}

        {/* Local Audio UI */}
        {mediaType === "audio" && (
          <div className="flex flex-col items-center space-y-2 text-white">
            <div className="text-3xl font-semibold">{channel}</div>
            <div className="text-sm text-gray-400">Audio Call</div>
          </div>
        )}
      </div>

      {/* Controls */}
      {joined && (
        <div className="absolute lg:bottom-6 md:bottom-32 bottom-40 left-0 right-0 flex justify-center gap-4">
          <button
            onClick={toggleMute}
            className="p-3 bg-gray-800 rounded-full text-white hover:bg-gray-700"
          >
            {muted ? (
              <MicOff className="w-6 h-6" />
            ) : (
              <Mic className="w-6 h-6" />
            )}
          </button>

          {videoCallsAllowed && (
            <button
              onClick={toggleVideo}
              className="p-3 bg-gray-800 rounded-full text-white hover:bg-gray-700"
              disabled={!localVideoTrackRef.current}
            >
              {videoOff ? (
                <VideoOff className="w-6 h-6" />
              ) : (
                <Video className="w-6 h-6" />
              )}
            </button>
          )}

          {videoCallsAllowed && (
            <button
              onClick={switchMediaMode}
              className="p-3 bg-gray-800 rounded-full text-white hover:bg-gray-700"
            >
              <Repeat className="w-6 h-6" />
            </button>
          )}

          <button
            onClick={leaveChannel}
            className="p-3 bg-red-600 rounded-full text-white hover:bg-red-700"
          >
            <PhoneOff className="w-6 h-6" />
          </button>
        </div>
      )}
    </div>
  );
}
