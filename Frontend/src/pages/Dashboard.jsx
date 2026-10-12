import React, { useCallback, useEffect, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  AtSign, Building2, CheckCircle2, Home, LayoutDashboard, LogOut, Mail,
  MapPin, Pencil, Phone, Plus, ShieldCheck, Trash2, UserRound, UsersRound, X,
} from "lucide-react";
import toast from "react-hot-toast";
import { useLocation, useNavigate } from "react-router-dom";
import Navbar from "../components/layout/Navbar";
import Input from "../components/common/Input";
import Button from "../components/common/Button";
import Loader from "../components/common/Loader";
import useAuth from "../hooks/useAuth";
import authService from "../services/authService";
import { validationRules } from "../utils/validation";

const emptyAddress = { street: "", city: "", state: "", pincode: "", country: "", phone: "", isDefault: false };

function SectionIcon({ children, green = false }) {
  return <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${green ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400" : "bg-primary-50 text-primary dark:bg-primary/15 dark:text-primary-300"}`}>{children}</span>;
}

function DashboardSidebar({ logout }) {
  const links = [
    ["dashboard", "Dashboard", LayoutDashboard], ["profile", "Profile", UserRound],
    ["addresses", "Addresses", MapPin], ["security", "Security", ShieldCheck],
  ];
  const scroll = (id) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  return (
    <aside className="dashboard-sidebar fixed inset-y-0 left-0 z-50 hidden w-60 flex-col border-r border-slate-200 bg-white dark:border-[#293548] dark:bg-[#0F172A] lg:flex">
      <button onClick={() => scroll("dashboard")} className="flex h-16 items-center gap-2.5 border-b border-slate-100 px-7 text-left dark:border-[#293548]">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-white"><ShieldCheck className="h-5 w-5" /></span>
        <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">AuthFlow</span>
      </button>
      <nav className="space-y-1 p-4" aria-label="Dashboard sections">
        {links.map(([id, label, Icon], index) => (
          <button key={id} onClick={() => scroll(id)} className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium ${index === 0 ? "bg-primary-50 text-primary dark:bg-primary/20 dark:text-primary-300" : "text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800"}`}>
            <Icon className="h-4 w-4" />{label}
          </button>
        ))}
      </nav>
      <div className="mt-auto space-y-1 border-t border-slate-100 p-4 dark:border-[#293548]">
        <button onClick={logout} className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-red-50 hover:text-red-600 dark:text-slate-400 dark:hover:bg-red-950/30 dark:hover:text-red-400"><LogOut className="h-4 w-4" />Logout</button>
      </div>
    </aside>
  );
}

function MobileNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const links = [["/dashboard", "Dashboard", LayoutDashboard], ["/profile", "Profile", UserRound], ["/addresses", "Addresses", MapPin]];
  return <nav className="dashboard-mobile-nav fixed inset-x-0 bottom-0 z-40 grid grid-cols-3 border-t border-slate-200 bg-white/95 px-2 pb-[env(safe-area-inset-bottom)] dark:border-[#293548] dark:bg-[#0F172A]/95 lg:hidden" aria-label="Mobile navigation">
    {links.map(([path, label, Icon]) => <button key={path} onClick={() => navigate(path)} aria-current={location.pathname === path ? "page" : undefined} className={`flex min-h-16 flex-col items-center justify-center gap-1 text-[10px] font-medium ${location.pathname === path ? "text-primary dark:text-primary-300" : "text-slate-500 dark:text-slate-400"}`}><Icon className="h-4 w-4" />{label}</button>)}
  </nav>;
}

export function Dashboard({ view = "overview" }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [addresses, setAddresses] = useState([]);
  const [isLoadingAddresses, setIsLoadingAddresses] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [addressToEdit, setAddressToEdit] = useState(null);
  const [addressToDelete, setAddressToDelete] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const modalRef = useRef(null);
  const { control, handleSubmit, reset, setError, formState: { isSubmitting, isValid } } = useForm({ mode: "onChange", defaultValues: emptyAddress });

  const fetchAddresses = useCallback(async () => {
    try { setIsLoadingAddresses(true); const data = await authService.getUserAddresses(); setAddresses(data?.addresses || []); }
    catch (err) { toast.error(err.message || "Failed to load addresses."); }
    finally { setIsLoadingAddresses(false); }
  }, []);
  useEffect(() => { fetchAddresses(); }, [fetchAddresses]);

  const closeModal = useCallback(() => { setModalOpen(false); setAddressToEdit(null); reset(emptyAddress); }, [reset]);
  useEffect(() => {
    if (!modalOpen) return undefined;
    const previousFocus = document.activeElement;
    const onKeyDown = (event) => {
      if (event.key === "Escape" && !isSubmitting) closeModal();
      if (event.key === "Tab") {
        const items = modalRef.current?.querySelectorAll('button:not([disabled]), input:not([disabled])');
        if (!items?.length) return;
        const first = items[0], last = items[items.length - 1];
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
      }
    };
    document.addEventListener("keydown", onKeyDown);
    requestAnimationFrame(() => modalRef.current?.querySelector("input")?.focus());
    return () => { document.removeEventListener("keydown", onKeyDown); previousFocus?.focus?.(); };
  }, [modalOpen, closeModal, isSubmitting]);

  const openAdd = () => { setAddressToEdit(null); reset(emptyAddress); setModalOpen(true); };
  const openEdit = (address) => {
    setAddressToEdit(address);
    reset({ ...address, pincode: String(address.pincode), phone: String(address.phone), isDefault: Boolean(address.isDefault) });
    setModalOpen(true);
  };
  const saveAddress = async (data) => {
    const pin = String(data.pincode).trim(), phone = String(data.phone).trim();
    if (!/^\d{6}$/.test(pin)) { setError("pincode", { message: "Pincode must be exactly 6 digits" }); return; }
    if (!/^[6-9]\d{9}$/.test(phone)) { setError("phone", { message: "Phone must be a valid 10-digit number starting with 6-9" }); return; }
    const payload = { street: data.street.trim(), city: data.city.trim(), state: data.state.trim(), country: data.country.trim(), pincode: Number(pin), phone: Number(phone), isDefault: Boolean(data.isDefault) };
    try {
      const result = addressToEdit ? await authService.updateUserAddress(addressToEdit._id, payload) : await authService.addUserAddress(payload);
      setAddresses(result.addresses || []); toast.success(result.message || "Address saved successfully!"); closeModal();
    } catch (err) {
      err.errors?.forEach((item) => item.field && setError(item.field, { type: "server", message: item.message }));
      toast.error(err.errors?.[0]?.message || err.message || "Unable to save address.");
    }
  };
  const deleteAddress = async () => {
    if (!addressToDelete) return;
    setDeletingId(addressToDelete._id);
    try { const result = await authService.deleteUserAddress(addressToDelete._id); setAddresses(result.addresses || addresses.filter((a) => a._id !== addressToDelete._id)); toast.success(result.message || "Address deleted."); setAddressToDelete(null); }
    catch (err) { toast.error(err.message || "Failed to delete address."); }
    finally { setDeletingId(null); }
  };

  const fullName = user?.fullName ? `${user.fullName.firstName} ${user.fullName.lastName}`.trim() : user?.username || "User";
  const initials = user?.fullName ? `${user.fullName.firstName?.[0] || ""}${user.fullName.lastName?.[0] || ""}` : user?.username?.slice(0, 2) || "U";
  const verified = Boolean(user?.isEmailVerified);
  const card = "dashboard-card rounded-2xl border border-slate-200 bg-white shadow-subtle dark:border-[#293548] dark:bg-[#151E2E] dark:shadow-none";

  const profileRows = [
    [UserRound, "Full Name", fullName], [UsersRound, "Username", `@${user?.username || ""}`],
    [Mail, "Email", user?.email], [ShieldCheck, "Role", user?.role || "user"],
  ];

  return <div id="dashboard" className="dashboard-page min-h-screen bg-slate-50 text-slate-900 dark:bg-[#0B1120] dark:text-slate-50">
    <Navbar />
    <main className="dashboard-content px-4 pb-24 pt-20 sm:px-6 lg:px-8 lg:pb-10">
      <div className="mx-auto max-w-6xl space-y-5">
        <section className={`${card} relative overflow-hidden p-5 sm:p-7`}>
          <div className="absolute -right-16 -top-24 h-64 w-64 rounded-full bg-primary-50 dark:bg-primary/5" />
          <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <span className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-full bg-primary text-lg font-bold text-white shadow-lg shadow-primary/20">{user?.profileImage ? <img src={user.profileImage} alt="" className="h-full w-full object-cover" /> : initials}</span>
              <div><p className="text-xs font-semibold text-primary dark:text-primary-300">Welcome back,</p><h1 className="text-xl font-bold tracking-tight sm:text-2xl">{fullName}!</h1><p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Manage your account, security, and saved addresses.</p></div>
            </div>
            <Button variant="outline" size="sm" leftIcon={Pencil} onClick={() => navigate("/profile/edit")}>Edit profile</Button>
          </div>
        </section>

        {view !== "addresses" && <div className={`${view === "overview" ? "dashboard-overview-grid" : ""} grid gap-5 ${view === "profile" ? "lg:grid-cols-1" : "lg:grid-cols-2"}`}>
          {(view === "overview" || view === "profile") && <section id="profile" className={`${card} scroll-mt-20 p-5 sm:p-6`}>
            <div className="mb-4 flex items-center gap-3"><SectionIcon><UserRound className="h-4 w-4" /></SectionIcon><h2 className="font-bold">Account Overview</h2></div>
            <dl>{profileRows.map(([Icon, label, value]) => <div key={label} className="profile-row grid grid-cols-[1fr_auto] items-center gap-4 border-b border-slate-100 py-3 last:border-0 dark:border-[#293548]"><dt className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400"><Icon className="h-4 w-4 text-primary dark:text-primary-300" />{label}</dt><dd className="max-w-[190px] truncate text-xs font-medium sm:max-w-xs">{value}</dd></div>)}
              <div className="grid grid-cols-[1fr_auto] items-center gap-4 py-3"><dt className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400"><AtSign className="h-4 w-4 text-primary dark:text-primary-300" />Email Status</dt><dd className="rounded-md bg-emerald-50 px-2 py-1 text-[11px] font-semibold text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400">{verified ? "Verified" : "Unverified"}</dd></div>
            </dl>
          </section>}
          {view === "overview" && <section id="security" className={`${card} scroll-mt-20 p-5 sm:p-6`}>
            <div className="mb-4 flex items-center gap-3"><SectionIcon green><ShieldCheck className="h-4 w-4" /></SectionIcon><h2 className="font-bold">Account Security</h2></div>
            <div className="space-y-2">
              <div className="security-row flex items-center justify-between rounded-xl bg-slate-50 p-3 dark:bg-slate-800/70"><div><p className="text-xs font-medium">Email Verification</p><p className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">Your email is {verified ? "verified" : "not verified"}</p></div><span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">{verified ? "Verified" : "Pending"}</span></div>
              <div className="security-row flex items-center justify-between rounded-xl bg-slate-50 p-3 dark:bg-slate-800/70"><div><p className="text-xs font-medium">Active Session</p><p className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">You are securely signed in</p></div><span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">Active</span></div>
            </div>
          </section>}
        </div>}

        {(view === "overview" || view === "addresses") && <section id="addresses" className={`${card} scroll-mt-20 p-5 sm:p-6`}>
          <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"><div className="flex items-center gap-3"><SectionIcon><MapPin className="h-4 w-4" /></SectionIcon><div><h2 className="font-bold">Saved Addresses <span className="ml-1 text-sm font-medium text-slate-500">({addresses.length})</span></h2><p className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">Manage your saved delivery destinations and default locations.</p></div></div><Button size="sm" onClick={openAdd} leftIcon={Plus} className="w-full sm:w-auto">Add new address</Button></div>
          {isLoadingAddresses ? <div className="py-12"><Loader text="Loading your addresses..." /></div> : addresses.length === 0 ? <div className="rounded-xl border border-dashed border-slate-300 py-10 text-center dark:border-slate-600"><MapPin className="mx-auto h-7 w-7 text-slate-400" /><h3 className="mt-3 text-sm font-semibold">No saved addresses</h3><p className="mt-1 text-xs text-slate-500">Add an address to use during checkout or shipping.</p><Button size="sm" variant="outline" onClick={openAdd} leftIcon={Plus} className="mt-4">Add your first address</Button></div> : <div className="grid gap-3 md:grid-cols-2">
            {addresses.map((address) => <article key={address._id} className={`address-card rounded-xl border p-4 ${address.isDefault ? "address-card-default border-primary bg-primary-50/20 dark:bg-primary/5" : "border-slate-200 dark:border-[#293548]"}`}>
              <div className="flex items-start justify-between gap-3"><div className="flex items-center gap-2"><span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-primary dark:bg-slate-800 dark:text-primary-300">{address.isDefault ? <Home className="h-4 w-4" /> : <Building2 className="h-4 w-4" />}</span><p className="text-sm font-semibold">{address.street}</p></div>{address.isDefault && <span className="rounded-md bg-primary px-2 py-1 text-[10px] font-semibold text-white">Default</span>}</div>
              <div className="mt-3 space-y-1.5 pl-10 text-xs text-slate-600 dark:text-slate-400"><p>{address.city}, {address.state} - {address.pincode}</p><p>◉&nbsp; {address.country}</p><p className="flex items-center gap-1.5"><Phone className="h-3.5 w-3.5" />{address.phone}</p></div>
              <div className="address-actions mt-4 flex justify-end gap-2 border-t border-slate-100 pt-3 dark:border-[#293548]"><Button size="sm" variant="outline" onClick={() => openEdit(address)} leftIcon={Pencil} aria-label={`Edit address ${address.street}`}>Edit</Button><Button size="sm" variant="ghost" onClick={() => setAddressToDelete(address)} leftIcon={Trash2} className="!bg-red-50 !text-red-600 dark:!bg-red-500/10 dark:!text-red-400" aria-label={`Delete address ${address.street}`}>Delete</Button></div>
            </article>)}
          </div>}
        </section>}
      </div>
    </main><MobileNav />

    {modalOpen && <div className="fixed inset-0 z-[60] flex items-end justify-center overflow-y-auto bg-slate-950/55 p-0 backdrop-blur-sm sm:items-center sm:p-5" role="presentation" onMouseDown={(e) => { if (e.target === e.currentTarget && !isSubmitting) closeModal(); }}>
      <div ref={modalRef} role="dialog" aria-modal="true" aria-labelledby="address-dialog-title" className="dashboard-modal max-h-[94vh] w-full overflow-y-auto rounded-t-2xl border border-slate-200 bg-white p-5 text-slate-900 shadow-elevated dark:border-[#293548] dark:bg-[#151E2E] dark:text-slate-50 sm:max-w-2xl sm:rounded-2xl sm:p-6">
        <div className="flex items-start justify-between"><div><h2 id="address-dialog-title" className="text-lg font-bold">{addressToEdit ? "Edit Address" : "Add New Address"}</h2><p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Fill in your address details to save a new location.</p></div><button onClick={closeModal} disabled={isSubmitting} aria-label="Close address form" className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"><X className="h-5 w-5" /></button></div>
        <form onSubmit={handleSubmit(saveAddress)} className="mt-5 grid gap-4 sm:grid-cols-2" noValidate>
          <AddressInput name="street" label="Street Address" control={control} rules={validationRules.address.street} placeholder="e.g. Main Road, Near Bus Stand" />
          <AddressInput name="city" label="City" control={control} rules={validationRules.address.city} placeholder="e.g. Baripada" letters />
          <AddressInput name="state" label="State / Province" control={control} rules={validationRules.address.state} placeholder="e.g. Odisha" letters />
          <AddressInput name="country" label="Country" control={control} rules={validationRules.address.country} placeholder="e.g. India" letters />
          <AddressInput name="pincode" label="Pincode / Postal Code" control={control} rules={validationRules.address.pincode} placeholder="6-digit PIN code" numeric maxLength={6} />
          <AddressInput name="phone" label="Contact phone number" control={control} rules={validationRules.address.phone} placeholder="10-digit mobile number" numeric maxLength={10} />
          <Controller name="isDefault" control={control} render={({ field }) => <label className="flex cursor-pointer items-center gap-2 text-xs text-slate-700 dark:text-slate-300 sm:col-span-2"><input type="checkbox" checked={field.value} onChange={(e) => field.onChange(e.target.checked)} className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary" />Set as default address</label>} />
          <div className="flex flex-col-reverse gap-2 border-t border-slate-100 pt-4 dark:border-[#293548] sm:col-span-2 sm:flex-row sm:justify-end"><Button variant="outline" onClick={closeModal} disabled={isSubmitting}>Cancel</Button><Button type="submit" isLoading={isSubmitting} disabled={isSubmitting || !isValid}>{addressToEdit ? "Update address" : "Save address"}</Button></div>
        </form>
      </div>
    </div>}

    {addressToDelete && <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/55 p-4 backdrop-blur-sm" role="alertdialog" aria-modal="true"><div className={`${card} w-full max-w-sm p-6`}><SectionIcon><Trash2 className="h-4 w-4" /></SectionIcon><h2 className="mt-4 font-bold">Delete Address?</h2><p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Remove “{addressToDelete.street}”? This action cannot be undone.</p><div className="mt-5 flex justify-end gap-2"><Button size="sm" variant="outline" onClick={() => setAddressToDelete(null)} disabled={Boolean(deletingId)}>Cancel</Button><Button size="sm" variant="danger" onClick={deleteAddress} isLoading={deletingId === addressToDelete._id}>Delete address</Button></div></div></div>}
  </div>;
}

function AddressInput({ name, label, control, rules, letters = false, numeric = false, maxLength, ...props }) {
  return <Controller name={name} control={control} rules={rules} render={({ field, fieldState: { error } }) => <Input id={name} label={label} required value={field.value} error={error?.message} inputMode={numeric ? "numeric" : undefined} maxLength={maxLength} onBlur={field.onBlur} ref={field.ref} onChange={(event) => {
    let value = event.target.value;
    if (numeric) value = value.replace(/\D/g, "").slice(0, maxLength);
    else if (letters) value = value.replace(/[^a-zA-Z\s.'-]/g, "");
    else value = value.replace(/[^a-zA-Z0-9\s,.'#/-]/g, "").slice(0, 150);
    field.onChange(value);
  }} {...props} />} />;
}

export default Dashboard;
