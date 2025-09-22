"use client";

import React, { useCallback, useRef, useState, DragEvent, ChangeEvent, useEffect } from "react";
import { cn } from "@/lib/utils";
import { UploadCloud, FileText, X, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";

export function getFilenameFromUrl(url: string): string {
    if (!url) {
        return "";
    }
    try {
        const parsedUrl = new URL(url);
        const pathname = parsedUrl.pathname;
        return decodeURIComponent(pathname.substring(pathname.lastIndexOf("/") + 1));
    } catch (_e) {
        const parts = url.split("/");
        return parts[parts.length - 1] || "unknown_file";
    }
}

export function formatFileSize(bytes: number, si = false, dp = 1) {
    const thresh = si ? 1000 : 1024;
    if (Math.abs(bytes) < thresh) return bytes + " B";
    const units = si
        ? ["kB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"]
        : ["KiB", "MiB", "GiB", "TiB", "PiB", "EiB", "ZiB", "YiB"];
    let u = -1;
    const r = 10 ** dp;
    do {
        bytes /= thresh;
        ++u;
    } while (Math.round(Math.abs(bytes) * r) / r >= thresh && u < units.length - 1);
    return bytes.toFixed(dp) + " " + units[u];
}

interface FileInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "value" | "onChange"> {
    id?: string;
    value?: File | null;
    onChange?: (file: File | null) => void;
    acceptedFileTypes?: string;
    maxFileSizeMB?: number;
    disabled?: boolean;
    className?: string;
}

export const FileInput = ({
    id,
    value,
    onChange,
    acceptedFileTypes = ".jpeg,.jpg,.png",
    maxFileSizeMB,
    disabled = false,
    className,
    ...props
}: FileInputProps) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [selectedFileInternal, setSelectedFileInternal] = useState<File | null>(value || null);
    const [isDragging, setIsDragging] = useState<boolean>(false);
    const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);

    const generatedId = React.useId();
    const inputId = id ?? `file-upload-${generatedId}`;

    useEffect(() => {
        setSelectedFileInternal(value || null);
        setStatus(null);
    }, [value]);

    const resetFileInput = useCallback(() => {
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    }, []);

    const handleFileChangeInternal = useCallback(
        (file: File | null) => {
            setStatus(null);
            if (!file) {
                setSelectedFileInternal(null);
                onChange?.(null);
                resetFileInput();
                return;
            }

            const fileExtension = file.name.split(".").pop()?.toLowerCase();
            const allowedExtensions = acceptedFileTypes.split(",").map((ext) => ext.trim().replace(".", ""));

            if (!fileExtension || !allowedExtensions.includes(fileExtension)) {
                setStatus({
                    type: "error",
                    message: `Invalid file type. Accepted: ${allowedExtensions.map((ext) => ext.toUpperCase()).join(", ")}`,
                });
                setSelectedFileInternal(null);
                onChange?.(null);
                resetFileInput();
                return;
            }

            if (maxFileSizeMB && file.size > maxFileSizeMB * 1024 * 1024) {
                setStatus({
                    type: "error",
                    message: `File size exceeds limit (${maxFileSizeMB} MB).`,
                });
                setSelectedFileInternal(null);
                onChange?.(null);
                resetFileInput();
                return;
            }

            setSelectedFileInternal(file);
            onChange?.(file);
        },
        [acceptedFileTypes, maxFileSizeMB, onChange, resetFileInput]
    );

    const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0] || null;
        handleFileChangeInternal(file);
        event.target.value = "";
    };

    const handleRemoveFile = useCallback(() => {
        handleFileChangeInternal(null);
    }, [handleFileChangeInternal]);

    const handleDragOver = useCallback(
        (event: DragEvent<HTMLLabelElement>) => {
            event.preventDefault();
            event.stopPropagation();
            if (!disabled) setIsDragging(true);
        },
        [disabled]
    );

    const handleDragLeave = useCallback((event: DragEvent<HTMLLabelElement>) => {
        event.preventDefault();
        event.stopPropagation();
        setIsDragging(false);
    }, []);

    const handleDrop = useCallback(
        (event: DragEvent<HTMLLabelElement>) => {
            event.preventDefault();
            event.stopPropagation();
            setIsDragging(false);
            if (disabled) return;

            const file = event.dataTransfer.files?.[0] || null;
            handleFileChangeInternal(file);
        },
        [disabled, handleFileChangeInternal]
    );

    const displayFile = selectedFileInternal;
    const fileName = displayFile?.name;
    const fileSize = displayFile ? formatFileSize(displayFile.size) : "";

    const allowedExtensionsDisplay = acceptedFileTypes
        .split(",")
        .map((ext) => ext.trim().replace(".", "").toUpperCase())
        .join(", ");

    return (
        <div className={cn("flex w-full flex-col gap-2", className)}>
            <Input
                id={inputId}
                type="file"
                ref={fileInputRef}
                onChange={handleInputChange}
                className="hidden"
                disabled={disabled}
                accept={acceptedFileTypes}
                {...props}
            />

            <label
                htmlFor={inputId}
                className={cn(
                    "flex w-full flex-col items-center justify-center",
                    "cursor-pointer rounded-lg border-2 border-dashed transition-colors duration-200 ease-in-out",
                    "relative h-24 min-w-0 p-4",
                    disabled
                        ? "cursor-not-allowed border-gray-200 bg-gray-100 text-gray-400"
                        : isDragging
                          ? "border-indigo-500 bg-indigo-50"
                          : "border-gray-300 bg-gray-50 hover:border-gray-400 hover:bg-gray-100"
                )}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                aria-label="Click to upload file or drag and drop"
            >
                <div className="pointer-events-none flex w-full items-center justify-center gap-2 px-2 py-2 text-center sm:gap-3 sm:px-3">
                    <UploadCloud
                        className={cn(
                            "h-5 w-5 flex-shrink-0 sm:h-6 sm:w-6",
                            disabled ? "text-gray-400" : isDragging ? "text-indigo-500" : "text-gray-400"
                        )}
                        aria-hidden="true"
                    />
                    <div className="min-w-0 flex-1 text-left">
                        <p className="text-xs text-gray-600 sm:text-sm">
                            <span className="font-medium">Drop file or</span>{" "}
                            <span className="font-semibold text-indigo-600 hover:underline">Choose</span>
                        </p>
                        <p className="text-xs break-words text-gray-500">
                            {allowedExtensionsDisplay} {maxFileSizeMB ? `(Max ${maxFileSizeMB} MB)` : ""}
                        </p>
                    </div>
                </div>
            </label>

            {displayFile && (
                <motion.div
                    className={cn(
                        "flex min-h-[4rem] w-full items-center justify-between gap-3 p-3",
                        "border-primary-200 bg-primary-50 rounded-lg border"
                    )}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.2 }}
                >
                    <div className="flex min-w-0 flex-1 items-center gap-3">
                        <FileText className="text-primary-600 h-5 w-5 flex-shrink-0" />
                        <div className="min-w-0 flex-1 overflow-hidden">
                            <div
                                className="text-primary-800 mb-1 text-sm leading-tight font-medium break-all"
                                title={fileName}
                            >
                                {fileName}
                            </div>
                            <div className="text-primary-600 text-xs">{fileSize}</div>
                        </div>
                    </div>
                    {!disabled && (
                        <Button
                            variant="ghost"
                            size="icon"
                            className="text-primary-500 hover:bg-primary-100 hover:text-primary-700 h-8 w-8 flex-shrink-0 rounded-full"
                            onClick={handleRemoveFile}
                            aria-label="Remove file"
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    )}
                </motion.div>
            )}

            {status && (
                <motion.div
                    className={cn(
                        "flex w-full items-start px-1 text-xs",
                        status.type === "error" ? "text-red-600" : "text-green-600"
                    )}
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    {status.type === "success" ? (
                        <CheckCircle2 className="mt-0.5 mr-1 h-3.5 w-3.5 flex-shrink-0" />
                    ) : (
                        <XCircle className="mt-0.5 mr-1 h-3.5 w-3.5 flex-shrink-0" />
                    )}
                    <span className="break-words">{status.message}</span>
                </motion.div>
            )}
        </div>
    );
};
