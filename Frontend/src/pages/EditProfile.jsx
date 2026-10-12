import React, { useState } from "react";
import { Camera, Save, UserRound, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import Navbar from "../components/layout/Navbar";
import Input from "../components/common/Input";
import Button from "../components/common/Button";
import useAuth from "../hooks/useAuth";
import authService from "../services/authService";

export default function EditProfile() {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    firstName: user?.fullName?.firstName || "",
    lastName: user?.fullName?.lastName || "",
    username: user?.username || "",
    phone: user?.phone || "",
    profileImage: user?.profileImage || "",
    profileImageFile: null,
    removeProfileImage: false,
  });

  const change = (key) => (event) => setForm((current) => ({ ...current, [key]: event.target.value }));
  const chooseImage = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!/^image\/(jpeg|png|webp)$/.test(file.type) || file.size > 2 * 1024 * 1024) {
      toast.error("Choose a JPG, PNG, or WebP image under 2 MB.");
      event.target.value = "";
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setForm((current) => ({ ...current, profileImage: reader.result, profileImageFile: file, removeProfileImage: false }));
    reader.readAsDataURL(file);
  };
  const submit = async (event) => {
    event.preventDefault();
    if (!form.firstName.trim() || !form.lastName.trim() || !/^[a-zA-Z0-9_]{3,30}$/.test(form.username) || (form.phone && !/^[6-9]\d{9}$/.test(form.phone))) {
      toast.error("Please enter valid profile details."); return;
    }
    try {
      setSaving(true);
      const payload = new FormData();
      payload.append("firstName", form.firstName.trim());
      payload.append("lastName", form.lastName.trim());
      payload.append("username", form.username.trim());
      payload.append("phone", form.phone.trim());
      payload.append("removeProfileImage", String(form.removeProfileImage));
      if (form.profileImageFile) payload.append("profileImage", form.profileImageFile);
      const result = await authService.updateUserProfile(payload);
      updateUser(result.user); toast.success(result.message || "Profile updated successfully"); navigate("/profile");
    } catch (error) { toast.error(error.errors?.[0]?.message || error.message || "Unable to update profile."); }
    finally { setSaving(false); }
  };

  const initials = `${form.firstName[0] || ""}${form.lastName[0] || ""}` || "U";
  return <div className="dashboard-page min-h-screen"><Navbar /><main className="px-4 pb-20 pt-24 sm:px-6"><div className="mx-auto max-w-3xl">
    <div className="mb-6"><p className="text-xs font-semibold text-primary">ACCOUNT SETTINGS</p><h1 className="mt-1 text-2xl font-bold">Edit profile</h1><p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Update your public account information. Your email address cannot be changed.</p></div>
    <form onSubmit={submit} className="dashboard-card rounded-2xl border p-5 shadow-subtle sm:p-8">
      <div className="flex flex-col items-center gap-4 border-b border-slate-200 pb-6 dark:border-[#293548] sm:flex-row">
        <div className="relative flex h-24 w-24 items-center justify-center overflow-hidden rounded-full bg-primary text-2xl font-bold text-white">{form.profileImage ? <img src={form.profileImage} alt="Profile preview" className="h-full w-full object-cover" /> : initials}<label className="absolute inset-x-0 bottom-0 flex cursor-pointer justify-center bg-slate-950/65 py-1.5 text-white"><Camera className="h-4 w-4" /><input type="file" accept="image/jpeg,image/png,image/webp" onChange={chooseImage} className="sr-only" /></label></div>
        <div className="text-center sm:text-left"><h2 className="font-semibold">Profile photo</h2><p className="mt-1 text-xs text-slate-500 dark:text-slate-400">JPG, PNG, or WebP. Maximum 2 MB.</p>{form.profileImage && <button type="button" onClick={() => setForm((current) => ({ ...current, profileImage: "", profileImageFile: null, removeProfileImage: true }))} className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-red-600 dark:text-red-400"><X className="h-3.5 w-3.5" />Remove photo</button>}</div>
      </div>
      <div className="mt-6 grid gap-5 sm:grid-cols-2"><Input id="firstName" label="First name" required value={form.firstName} onChange={change("firstName")} maxLength={50} /><Input id="lastName" label="Last name" required value={form.lastName} onChange={change("lastName")} maxLength={50} /><Input id="username" label="Username" required value={form.username} onChange={(e) => setForm((c) => ({ ...c, username: e.target.value.replace(/[^a-zA-Z0-9_]/g, "").slice(0, 30) }))} leftIcon={UserRound} /><Input id="phone" label="Phone number" value={form.phone} onChange={(e) => setForm((c) => ({ ...c, phone: e.target.value.replace(/\D/g, "").slice(0, 10) }))} inputMode="numeric" placeholder="10-digit mobile number" /><Input id="email" label="Email address" value={user?.email || ""} disabled className="sm:col-span-2" helperText="Email changes are disabled for account security." /></div>
      <div className="mt-7 flex flex-col-reverse gap-3 border-t border-slate-200 pt-5 dark:border-[#293548] sm:flex-row sm:justify-end"><Button variant="outline" onClick={() => navigate("/profile")}>Cancel</Button><Button type="submit" leftIcon={Save} isLoading={saving}>Save changes</Button></div>
    </form>
  </div></main></div>;
}
