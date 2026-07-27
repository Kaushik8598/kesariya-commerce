"use client";

import { useState, useEffect } from "react";
import { useProfile, useUpdateProfile } from "@/hooks/profile/use-profile";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { User, Loader2 } from "lucide-react";
import { ProfileAvatarUploader } from "@/components/profile/avatar-uploader";

export default function ProfilePage() {
  const { data: profile, isLoading } = useProfile();
  const { mutate: updateProfile, isPending: isUpdating } = useUpdateProfile();

  const [formData, setFormData] = useState<{
    firstName: string;
    lastName: string;
    avatar: string | null;
  }>({
    firstName: "",
    lastName: "",
    avatar: null,
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        firstName: profile.firstName || "",
        lastName: profile.lastName || "",
        avatar: profile.avatar || null,
      });
    }
  }, [profile]);

  if (isLoading) {
    return (
      <div className="border border-border rounded-2xl p-6 md:p-8 bg-card shadow-sm space-y-6">
        <Skeleton className="h-8 w-44 mb-4" />
        <Skeleton className="h-28 w-28 rounded-full mx-auto" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile(formData);
  };

  return (
    <div className="border border-border rounded-2xl p-6 md:p-8 bg-card shadow-sm space-y-8">
      {/* Section Header */}
      <div className="flex items-center gap-3 border-b border-border pb-6">
        <div className="h-10 w-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center border border-primary/20">
          <User className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-lg font-black uppercase tracking-wider font-heading text-foreground">
            Personal Information
          </h2>
          <p className="text-xs text-muted-foreground font-medium">
            Update your profile picture, account name, and view registered contact details
          </p>
        </div>
      </div>

      {/* Profile Form containing Round Avatar Uploader */}
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Round Drag & Drop Avatar Uploader */}
        <div className="flex flex-col items-center justify-center border-b border-border pb-8">
          <p className="text-xs font-extrabold uppercase tracking-widest text-muted-foreground mb-4">
            Profile Picture / Avatar
          </p>
          <ProfileAvatarUploader
            avatarUrl={formData.avatar}
            onChangeAvatar={(newUrl) => setFormData({ ...formData, avatar: newUrl })}
            userName={`${formData.firstName} ${formData.lastName}`}
            disabled={isUpdating}
          />
        </div>

        {/* Input Fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
              First Name
            </label>
            <Input
              type="text"
              value={formData.firstName}
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
              Last Name
            </label>
            <Input
              type="text"
              value={formData.lastName}
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
            Email Address
          </label>
          <Input
            type="email"
            value={profile?.email || ""}
            disabled
            className="bg-secondary/50 text-muted-foreground cursor-not-allowed"
          />
          <p className="text-[10px] text-muted-foreground mt-1 uppercase tracking-wider font-mono">
            Email address cannot be changed.
          </p>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
            Phone Number
          </label>
          <Input
            type="text"
            value={profile?.mobile ? `${profile.countryCode || ""} ${profile.mobile}` : ""}
            disabled
            className="bg-secondary/50 text-muted-foreground cursor-not-allowed"
          />
        </div>

        <div className="pt-6 border-t border-border">
          <Button
            type="submit"
            disabled={isUpdating}
            className="w-full sm:w-auto px-8 font-bold uppercase tracking-wider text-xs"
          >
            {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Changes
          </Button>
        </div>
      </form>
    </div>
  );
}
