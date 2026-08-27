// app/dashboard/admin/settings/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { fetchApi } from '@/app/lib/api';
import {
  Settings,
  User,
  Lock,
  Globe,
  Bell,
  Save,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Shield,
  Mail,
} from 'lucide-react';

export default function AdminSettingsPage() {
    const [activeTab, setActiveTab] = useState<'profile' | 'platform' | 'security'>('profile');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    // Profile Form
    const [profileForm, setProfileForm] = useState({
        username: '',
        email: '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });

    // Platform Config State (Local / Global)
    const [platformConfig, setPlatformConfig] = useState({
        siteName: 'LearnHub LMS',
        supportEmail: 'support@learnhub.com',
        enableRegistration: true,
        enableQuizRetake: true,
        emailAlerts: true,
    });

    useEffect(() => {
        const loadAdminData = async () => {
        try {
            setLoading(true);
            const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

            if (!token) {
            console.warn('No token found in storage');
            return;
            }

            const cleanToken = token.replace(/^Bearer\s+/i, '').trim();
            const headers: Record<string, string> = {
            Authorization: `Bearer ${cleanToken}`,
            };

            const me = await fetchApi('/users/me', { headers });
            if (me && me.id) {
            setProfileForm((prev) => ({
                ...prev,
                username: me.username || '',
                email: me.email || '',
            }));
            }
        } catch (err: any) {
            console.warn('Could not fetch admin details:', err);
        } finally {
            setLoading(false);
        }
        };

        loadAdminData();
    }, []);

    const handleProfileSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setMessage(null);

        if (profileForm.newPassword && profileForm.newPassword !== profileForm.confirmPassword) {
        setMessage({ type: 'error', text: 'New passwords do not match' });
        setSaving(false);
        return;
        }

        try {
        const token = localStorage.getItem('token');
        const headers = {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        };

        const payload: any = {
            username: profileForm.username,
            email: profileForm.email,
        };

        if (profileForm.newPassword) {
            payload.password = profileForm.newPassword;
        }

        await fetchApi('/users/me', {
            method: 'PUT',
            headers,
            body: JSON.stringify(payload),
        });

        setMessage({ type: 'success', text: 'Settings updated successfully!' });
        setProfileForm((prev) => ({
            ...prev,
            currentPassword: '',
            newPassword: '',
            confirmPassword: '',
        }));
        } catch (err: any) {
        setMessage({ type: 'error', text: err.message || 'Failed to update profile' });
        } finally {
        setSaving(false);
        }
    };

    const handlePlatformSave = (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setTimeout(() => {
        setSaving(false);
        setMessage({ type: 'success', text: 'Platform preferences saved successfully!' });
        }, 600);
    };

    if (loading) {
        return (
        <div className="flex items-center justify-center py-28 text-slate-400 gap-2">
            <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
            <span>Loading settings...</span>
        </div>
        );
    }

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
        {/* Top Header */}
        <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Settings className="w-6 h-6 text-indigo-500" />
            Settings & Configuration
            </h1>
            <p className="text-xs text-slate-400 mt-1">
            Manage your administrator profile, security credentials, and system settings.
            </p>
        </div>

        {/* Alert Messages */}
        {message && (
            <div
            className={`p-4 rounded-xl flex items-center gap-3 text-xs font-medium border ${
                message.type === 'success'
                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                : 'bg-red-500/10 border-red-500/20 text-red-400'
            }`}
            >
            {message.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
            <span>{message.text}</span>
            </div>
        )}

        {/* Tabs */}
        <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 p-1.5 rounded-2xl w-fit">
            <button
            onClick={() => { setActiveTab('profile'); setMessage(null); }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium transition ${
                activeTab === 'profile' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
            >
            <User className="w-3.5 h-3.5" /> Admin Profile
            </button>

            <button
            onClick={() => { setActiveTab('platform'); setMessage(null); }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium transition ${
                activeTab === 'platform' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
            >
            <Globe className="w-3.5 h-3.5" /> Platform Preferences
            </button>

            <button
            onClick={() => { setActiveTab('security'); setMessage(null); }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium transition ${
                activeTab === 'security' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
            >
            <Shield className="w-3.5 h-3.5" /> Security
            </button>
        </div>

        {/* 1. ADMIN PROFILE TAB */}
        {activeTab === 'profile' && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
            <div className="border-b border-slate-800 pb-3">
                <h2 className="text-base font-bold text-white">Profile Information</h2>
                <p className="text-xs text-slate-400">Update your account username and primary email address.</p>
            </div>

            <form onSubmit={handleProfileSave} className="space-y-4 max-w-lg">
                <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Admin Username</label>
                <input
                    type="text"
                    required
                    value={profileForm.username}
                    onChange={(e) => setProfileForm({ ...profileForm, username: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:border-indigo-500"
                />
                </div>

                <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Email Address</label>
                <input
                    type="email"
                    required
                    value={profileForm.email}
                    onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:border-indigo-500"
                />
                </div>

                <button
                type="submit"
                disabled={saving}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl flex items-center gap-2 shadow-lg transition"
                >
                {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                <span>Save Changes</span>
                </button>
            </form>
            </div>
        )}

        {/* 2. PLATFORM PREFERENCES TAB */}
        {activeTab === 'platform' && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
            <div className="border-b border-slate-800 pb-3">
                <h2 className="text-base font-bold text-white">LMS Platform Settings</h2>
                <p className="text-xs text-slate-400">General settings regarding course accessibility and registrations.</p>
            </div>

            <form onSubmit={handlePlatformSave} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">LMS Platform Name</label>
                    <input
                    type="text"
                    value={platformConfig.siteName}
                    onChange={(e) => setPlatformConfig({ ...platformConfig, siteName: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:border-indigo-500"
                    />
                </div>

                <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Support Email</label>
                    <input
                    type="email"
                    value={platformConfig.supportEmail}
                    onChange={(e) => setPlatformConfig({ ...platformConfig, supportEmail: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:border-indigo-500"
                    />
                </div>
                </div>

                <div className="space-y-3 pt-2">
                <label className="flex items-center justify-between p-3.5 bg-slate-950 border border-slate-800 rounded-xl cursor-pointer">
                    <div>
                    <p className="text-xs font-semibold text-white">Allow Student Self-Registration</p>
                    <p className="text-[11px] text-slate-400">Enable or disable open signups on the login page.</p>
                    </div>
                    <input
                    type="checkbox"
                    checked={platformConfig.enableRegistration}
                    onChange={(e) => setPlatformConfig({ ...platformConfig, enableRegistration: e.target.checked })}
                    className="w-4 h-4 accent-indigo-600 rounded cursor-pointer"
                    />
                </label>

                <label className="flex items-center justify-between p-3.5 bg-slate-950 border border-slate-800 rounded-xl cursor-pointer">
                    <div>
                    <p className="text-xs font-semibold text-white">Allow Quiz Retakes</p>
                    <p className="text-[11px] text-slate-400">Students can retake exams multiple times to improve score.</p>
                    </div>
                    <input
                    type="checkbox"
                    checked={platformConfig.enableQuizRetake}
                    onChange={(e) => setPlatformConfig({ ...platformConfig, enableQuizRetake: e.target.checked })}
                    className="w-4 h-4 accent-indigo-600 rounded cursor-pointer"
                    />
                </label>
                </div>

                <button
                type="submit"
                disabled={saving}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl flex items-center gap-2 shadow-lg transition"
                >
                {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                <span>Save System Settings</span>
                </button>
            </form>
            </div>
        )}

        {/* 3. SECURITY TAB */}
        {activeTab === 'security' && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
            <div className="border-b border-slate-800 pb-3">
                <h2 className="text-base font-bold text-white">Password & Security</h2>
                <p className="text-xs text-slate-400">Ensure your account is using a strong and secure password.</p>
            </div>

            <form onSubmit={handleProfileSave} className="space-y-4 max-w-lg">
                <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">New Password</label>
                <input
                    type="password"
                    placeholder="••••••••"
                    value={profileForm.newPassword}
                    onChange={(e) => setProfileForm({ ...profileForm, newPassword: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:border-indigo-500"
                />
                </div>

                <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Confirm New Password</label>
                <input
                    type="password"
                    placeholder="••••••••"
                    value={profileForm.confirmPassword}
                    onChange={(e) => setProfileForm({ ...profileForm, confirmPassword: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:border-indigo-500"
                />
                </div>

                <button
                type="submit"
                disabled={saving || !profileForm.newPassword}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl flex items-center gap-2 shadow-lg transition disabled:opacity-50"
                >
                {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Lock className="w-3.5 h-3.5" />}
                <span>Update Password</span>
                </button>
            </form>
        </div>
    )}
    </div>
  );
}