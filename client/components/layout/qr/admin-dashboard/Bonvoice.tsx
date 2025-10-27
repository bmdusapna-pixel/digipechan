"use client";
import { useEffect, useState } from "react";
import { apiRequest } from "@/common/utils/apiClient";
import { API_ENDPOINTS } from "@/common/constants/apiEndpoints";
import { API_METHODS } from "@/common/constants/apiMethods";
import { toast } from "sonner";
import { Button } from "@/components/ui/button"; // optional if you use shadcn/ui

interface BonvoiceData {
  username: string;
  password: string;
  did: string;
  token: string;
}

export default function BonvoiceSettings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [data, setData] = useState<BonvoiceData>({
    username: "",
    password: "",
    did: "",
    token: "",
  });

  // Fetch Bonvoice data
  const fetchBonvoice = async () => {
    try {
      setLoading(true);

      const bonvoice = await apiRequest<BonvoiceData>(
        API_METHODS.GET,
        API_ENDPOINTS.getBonvoice
      );

      if (bonvoice) {
        setData({
          username: bonvoice.username,
          password: bonvoice.password,
          did: bonvoice.did,
          token: bonvoice.token,
        });
      } else {
        toast.error("No Bonvoice data found");
      }
    } catch (err) {
      toast.error("Failed to fetch Bonvoice data");
      console.error("Error fetching Bonvoice:", err);
    } finally {
      setLoading(false);
    }
  };

  // Update Bonvoice info
  const handleUpdate = async () => {
    try {
      setSaving(true);

      const updatedBonvoice = await apiRequest<BonvoiceData>(
        API_METHODS.PUT,
        API_ENDPOINTS.updateBonvoice,
        {
          username: data.username,
          password: data.password,
          did: data.did,
        }
      );

      if (updatedBonvoice) {
        setData({
          username: updatedBonvoice.username,
          password: updatedBonvoice.password,
          did: updatedBonvoice.did,
          token: updatedBonvoice.token,
        });
        toast.success("Bonvoice updated successfully");
      } else {
        toast.error("Failed to update Bonvoice — no response data");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to update Bonvoice");
    } finally {
      setSaving(false);
    }
  };

  // Refresh token
  const handleRefreshToken = async () => {
    try {
      setRefreshing(true);

      const res = await apiRequest<{ username: string; token: string }>(
        API_METHODS.GET,
        API_ENDPOINTS.refreshBonvoiceToken
      );

      if (res?.token) {
        setData((prev) => ({ ...prev, token: res.token }));
        toast.success("Token refreshed successfully");
      } else {
        toast.error("No token found in response");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to refresh token");
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchBonvoice();
  }, []);

  if (loading)
    return <div className="text-center text-gray-500 mt-10">Loading...</div>;

  return (
    <div className="max-w-xl mx-auto mt-10 bg-white shadow-lg rounded-2xl p-6">
      <h1 className="text-2xl font-bold text-center mb-6">Bonvoice Settings</h1>

      <div className="space-y-4">
        {/* Username */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Username
          </label>
          <input
            type="text"
            value={data.username}
            onChange={(e) => setData({ ...data, username: e.target.value })}
            className="w-full border rounded-lg p-2"
          />
        </div>

        {/* Password */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Password
          </label>
          <input
            type="text"
            value={data.password}
            onChange={(e) => setData({ ...data, password: e.target.value })}
            className="w-full border rounded-lg p-2"
          />
        </div>

        {/* DID */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            DID
          </label>
          <input
            type="text"
            value={data.did}
            onChange={(e) => setData({ ...data, did: e.target.value })}
            className="w-full border rounded-lg p-2"
          />
        </div>

        {/* Token */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Token
          </label>
          <input
            type="text"
            value={data.token}
            readOnly
            className="w-full border rounded-lg p-2 bg-gray-100"
          />
        </div>
      </div>

      <div className="flex justify-between mt-6">
        <Button
          onClick={handleUpdate}
          disabled={saving}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
        >
          {saving ? "Saving..." : "Update"}
        </Button>

        <Button
          onClick={handleRefreshToken}
          disabled={refreshing}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
        >
          {refreshing ? "Refreshing..." : "Refresh Token"}
        </Button>
      </div>
    </div>
  );
}
