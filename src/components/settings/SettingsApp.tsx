import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  Search,
  User,
  Shield,
  Bell,
  MessageSquare,
  Palette,
  Database,
  Lock,
  Smartphone,
  Globe,
  HelpCircle,
  Info,
  Sparkles,
  LogOut,
  Key,
  AtSign,
  Mail,
  Phone,
  Eye,
  EyeOff,
  UserX,
  Fingerprint,
  Volume2,
  Vibrate,
  Monitor,
} from "lucide-react";
import { ProfileHeader } from "./ProfileHeader";
import { SettingGroup } from "./SettingGroup";
import { SettingItem } from "./SettingItem";
import { Toggle } from "./Toggle";
import { SettingsProvider, themeStyle, useSettings } from "./SettingsContext";
import { AppearanceScreen } from "./AppearanceScreen";
import { EditProfileScreen } from "./EditProfileScreen";
import { AvatarSheet } from "./AvatarSheet";
import { QRScreen } from "./QRScreen";

type SectionId =
  | "root"
  | "editProfile"
  | "qr"
  | "account"
  | "privacy"
  | "notifications"
  | "chats"
  | "appearance"
  | "storage"
  | "security"
  | "devices"
  | "language"
  | "help"
  | "about";

const SECTION_TITLES: Record<SectionId, string> = {
  root: "Settings",
  editProfile: "Edit Profile",
  qr: "My QR Code",
  account: "Account",
  privacy: "Privacy",
  notifications: "Notifications",
  chats: "Chats",
  appearance: "Appearance",
  storage: "Storage & Data",
  security: "Security",
  devices: "Linked Devices",
  language: "Language",
  help: "Help & Support",
  about: "About",
};

export function SettingsApp() {
  return (
    <SettingsProvider>
      <SettingsShell />
    </SettingsProvider>
  );
}

function SettingsShell() {
  const s = useSettings();
  const speed = s.motion === "fast" ? 0.14 : s.motion === "reduced" ? 0 : 0.24;
  const style = themeStyle(s.theme, s.accent, s.radius, s.fontSize, s.blur);

  return (
    <div style={style} className="min-h-svh w-full">
      <div
        className="min-h-svh w-full"
        style={{
          background: "var(--background)",
          color: "var(--foreground)",
        }}
      >
        <SettingsRoutes speed={speed} />
      </div>
    </div>
  );
}

function SettingsRoutes({ speed }: { speed: number }) {
  const [section, setSection] = useState<SectionId>("root");
  const [avatarOpen, setAvatarOpen] = useState(false);
  const [query, setQuery] = useState("");

  const [prefs, setPrefs] = useState({
    readReceipts: true,
    lastSeen: true,
    typingIndicator: true,
    pushMessages: true,
    pushMentions: true,
    pushCalls: true,
    inAppSounds: true,
    vibrate: false,
    enterToSend: true,
    autoDownload: false,
    biometric: true,
    twoFactor: false,
  });
  const setPref = <K extends keyof typeof prefs>(k: K, v: boolean) =>
    setPrefs((p) => ({ ...p, [k]: v }));

  const go = (s: SectionId) => setSection(s);
  const back = () => setSection("root");

  const ease: [number, number, number, number] = [0.16, 1, 0.3, 1];

  return (
    <div className="mx-auto flex min-h-svh w-full max-w-[520px] flex-col md:max-w-[560px]">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: speed || 0.01, ease }}
        className="glass sticky top-0 z-20 flex items-center gap-2 px-4 py-3"
        style={{ paddingTop: "max(env(safe-area-inset-top), 12px)" }}
      >
        <AnimatePresence mode="wait" initial={false}>
          {section !== "root" ? (
            <motion.button
              key="back"
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -6 }}
              transition={{ duration: 0.2 }}
              onClick={back}
              className="press flex h-9 w-9 items-center justify-center rounded-xl text-foreground hover:bg-[color-mix(in_oklab,var(--foreground)_6%,transparent)]"
              aria-label="Back"
            >
              <ArrowLeft size={20} />
            </motion.button>
          ) : (
            <motion.div
              key="spark"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="flex h-9 w-9 items-center justify-center rounded-xl"
              style={{ background: "var(--primary-soft)", color: "var(--primary)" }}
            >
              <Sparkles size={18} />
            </motion.div>
          )}
        </AnimatePresence>

        <motion.h1
          key={section}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="flex-1 truncate text-[17px] font-semibold tracking-tight text-foreground"
        >
          {SECTION_TITLES[section]}
        </motion.h1>
      </motion.header>

      <main className="flex-1 pb-16 pt-4">
        <AnimatePresence mode="wait">
          {section === "root" ? (
            <motion.div
              key="root"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: speed, ease }}
            >
              <ProfileHeader
                onAvatarClick={() => setAvatarOpen(true)}
                onEditClick={() => go("editProfile")}
                onQrClick={() => go("qr")}
              />

              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.04, duration: speed || 0.01 }}
                className="mx-3 mb-5"
              >
                <div className="flex items-center gap-2 rounded-xl bg-[color-mix(in_oklab,var(--foreground)_6%,transparent)] px-3 py-2">
                  <Search size={15} className="text-muted-foreground" strokeWidth={2.2} />
                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search settings"
                    className="w-full bg-transparent text-[13.5px] text-foreground outline-none placeholder:text-muted-foreground"
                  />
                </div>
              </motion.div>

              <SettingGroup label="Personal" delay={0.05}>
                <SettingItem icon={User} label="Account" description="Phone, email, username" onClick={() => go("account")} />
                <SettingItem icon={Shield} label="Privacy" description="Who can see your activity" onClick={() => go("privacy")} />
                <SettingItem icon={Lock} label="Security" description="2FA, passkeys, biometrics" tint="success" onClick={() => go("security")} last />
              </SettingGroup>

              <SettingGroup label="Experience" delay={0.1}>
                <SettingItem icon={Bell} label="Notifications" description="Alerts, sounds, mentions" onClick={() => go("notifications")} />
                <SettingItem icon={MessageSquare} label="Chats" description="Wallpaper, text size, backup" onClick={() => go("chats")} />
                <SettingItem icon={Palette} label="Appearance" description="Theme, accent, motion" onClick={() => go("appearance")} />
                <SettingItem icon={Database} label="Storage & Data" description="1.2 GB used · Auto-download" onClick={() => go("storage")} last />
              </SettingGroup>

              <SettingGroup label="System" delay={0.15}>
                <SettingItem icon={Smartphone} label="Linked Devices" trailing="3 active" onClick={() => go("devices")} />
                <SettingItem icon={Globe} label="Language" trailing="English" onClick={() => go("language")} last />
              </SettingGroup>

              <SettingGroup label="Support" delay={0.2}>
                <SettingItem icon={HelpCircle} label="Help & Support" onClick={() => go("help")} />
                <SettingItem icon={Info} label="About Hoox" description="Version 1.0.0 · Terms · Privacy" onClick={() => go("about")} last />
              </SettingGroup>

              <SettingGroup delay={0.25}>
                <SettingItem icon={LogOut} label="Sign out" danger showArrow={false} last />
              </SettingGroup>

              <p className="mt-2 text-center text-[11.5px] text-muted-foreground">
                Hoox · Built for traders
              </p>
            </motion.div>
          ) : (
            <motion.div
              key={section}
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 24 }}
              transition={{ duration: speed, ease }}
            >
              {section === "editProfile" && <EditProfileScreen onDone={back} />}
              {section === "qr" && <QRScreen />}
              {section === "appearance" && <AppearanceScreen />}

              {section === "account" && (
                <>
                  <SettingGroup label="Identity">
                    <SettingItem icon={AtSign} label="Username" trailing="@alex.morgan" />
                    <SettingItem icon={Phone} label="Phone" trailing="+1 (555) 018-2201" />
                    <SettingItem icon={Mail} label="Email" trailing="alex@hoox.io" last />
                  </SettingGroup>
                  <SettingGroup label="Actions">
                    <SettingItem icon={User} label="Edit profile" onClick={() => go("editProfile")} last />
                  </SettingGroup>
                  <SettingGroup label="Danger zone">
                    <SettingItem icon={UserX} label="Delete account" danger showArrow={false} last />
                  </SettingGroup>
                </>
              )}

              {section === "privacy" && (
                <SettingGroup label="Visibility">
                  <RowToggle icon={Eye} label="Read receipts" description="Show when you've read a message" checked={prefs.readReceipts} onChange={(v) => setPref("readReceipts", v)} />
                  <RowToggle icon={EyeOff} label="Last seen" description="Share when you were last online" checked={prefs.lastSeen} onChange={(v) => setPref("lastSeen", v)} />
                  <RowToggle icon={MessageSquare} label="Typing indicator" description="Signal while you're typing" checked={prefs.typingIndicator} onChange={(v) => setPref("typingIndicator", v)} last />
                </SettingGroup>
              )}

              {section === "notifications" && (
                <>
                  <SettingGroup label="Push">
                    <RowToggle icon={MessageSquare} label="Messages" checked={prefs.pushMessages} onChange={(v) => setPref("pushMessages", v)} />
                    <RowToggle icon={AtSign} label="Mentions & replies" checked={prefs.pushMentions} onChange={(v) => setPref("pushMentions", v)} />
                    <RowToggle icon={Phone} label="Calls" checked={prefs.pushCalls} onChange={(v) => setPref("pushCalls", v)} last />
                  </SettingGroup>
                  <SettingGroup label="In-app">
                    <RowToggle icon={Volume2} label="Sounds" checked={prefs.inAppSounds} onChange={(v) => setPref("inAppSounds", v)} />
                    <RowToggle icon={Vibrate} label="Vibrate" checked={prefs.vibrate} onChange={(v) => setPref("vibrate", v)} last />
                  </SettingGroup>
                </>
              )}

              {section === "chats" && (
                <>
                  <SettingGroup label="Behavior">
                    <RowToggle icon={MessageSquare} label="Enter to send" checked={prefs.enterToSend} onChange={(v) => setPref("enterToSend", v)} />
                    <RowToggle icon={Database} label="Auto-download media" description="On Wi-Fi only" checked={prefs.autoDownload} onChange={(v) => setPref("autoDownload", v)} last />
                  </SettingGroup>
                  <SettingGroup label="Appearance">
                    <SettingItem icon={Palette} label="Open Appearance" onClick={() => go("appearance")} last />
                  </SettingGroup>
                </>
              )}

              {section === "storage" && (
                <>
                  <SettingGroup label="Usage">
                    <StorageMeter used={1.2} total={16} />
                  </SettingGroup>
                  <SettingGroup label="Cleanup">
                    <SettingItem icon={Database} label="Manage storage" />
                    <SettingItem icon={Database} label="Clear cache" trailing="248 MB" last />
                  </SettingGroup>
                </>
              )}

              {section === "security" && (
                <>
                  <SettingGroup label="Sign-in">
                    <RowToggle icon={Fingerprint} label="Biometric unlock" description="Face ID or fingerprint" checked={prefs.biometric} onChange={(v) => setPref("biometric", v)} />
                    <RowToggle icon={Shield} label="Two-factor authentication" checked={prefs.twoFactor} onChange={(v) => setPref("twoFactor", v)} last />
                  </SettingGroup>
                  <SettingGroup label="Keys">
                    <SettingItem icon={Key} label="Passkeys" trailing="2" />
                    <SettingItem icon={Lock} label="Change password" last />
                  </SettingGroup>
                </>
              )}

              {section === "devices" && (
                <SettingGroup label="Active sessions">
                  <SettingItem icon={Smartphone} label="iPhone 15 Pro" description="This device · Now" tint="success" showArrow={false} />
                  <SettingItem icon={Monitor} label="MacBook Pro" description="Desktop · 2 hours ago" />
                  <SettingItem icon={Smartphone} label="iPad" description="Tablet · Yesterday" last />
                </SettingGroup>
              )}

              {section === "language" && (
                <SettingGroup label="Interface language">
                  {["English", "Français", "Español", "Deutsch", "العربية", "中文"].map((lang, i, arr) => (
                    <SettingItem
                      key={lang}
                      icon={Globe}
                      label={lang}
                      showArrow={false}
                      trailing={lang === "English" ? "✓" : undefined}
                      last={i === arr.length - 1}
                    />
                  ))}
                </SettingGroup>
              )}

              {section === "help" && (
                <SettingGroup label="Support">
                  <SettingItem icon={HelpCircle} label="FAQ" />
                  <SettingItem icon={MessageSquare} label="Contact support" />
                  <SettingItem icon={Info} label="Report a problem" last />
                </SettingGroup>
              )}

              {section === "about" && (
                <>
                  <motion.div
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: speed || 0.01, ease }}
                    className="mx-3 mb-6 flex flex-col items-center rounded-3xl border border-border bg-surface/70 p-8 text-center backdrop-blur-xl"
                  >
                    <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl text-white" style={{ background: "var(--gradient-brand)" }}>
                      <Sparkles size={26} />
                    </div>
                    <h2 className="text-[20px] font-semibold text-foreground">Hoox</h2>
                    <p className="mt-1 text-[13px] text-muted-foreground">Version 1.0.0 (build 2026.7)</p>
                    <p className="mt-4 max-w-[280px] text-[12.5px] text-muted-foreground">
                      A premium community platform built for traders. Private by default, fast by design.
                    </p>
                  </motion.div>
                  <SettingGroup>
                    <SettingItem icon={Info} label="Terms of service" />
                    <SettingItem icon={Shield} label="Privacy policy" last />
                  </SettingGroup>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <AvatarSheet open={avatarOpen} onClose={() => setAvatarOpen(false)} />
    </div>
  );
}

function RowToggle({
  icon: Icon,
  label,
  description,
  checked,
  onChange,
  last,
}: {
  icon: Parameters<typeof SettingItem>[0]["icon"];
  label: string;
  description?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  last?: boolean;
}) {
  return (
    <SettingItem
      icon={Icon}
      label={label}
      description={description}
      showArrow={false}
      last={last}
      onClick={() => onChange(!checked)}
      trailing={<Toggle checked={checked} onChange={onChange} label={label} />}
    />
  );
}

function StorageMeter({ used, total }: { used: number; total: number }) {
  const pct = Math.min(100, (used / total) * 100);
  return (
    <div className="p-5">
      <div className="mb-3 flex items-end justify-between">
        <div>
          <p className="text-[12px] uppercase tracking-wider text-muted-foreground">Used</p>
          <p className="text-[24px] font-semibold tracking-tight text-foreground">
            {used.toFixed(1)} <span className="text-[14px] text-muted-foreground">/ {total} GB</span>
          </p>
        </div>
        <p className="text-[13px] text-[var(--primary)]">{pct.toFixed(0)}%</p>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-[color-mix(in_oklab,var(--foreground)_8%,transparent)]">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          className="h-full rounded-full"
          style={{ background: "var(--gradient-brand)" }}
        />
      </div>
      <div className="mt-4 grid grid-cols-3 gap-2 text-center">
        {[
          { label: "Media", value: "820 MB", color: "var(--primary)" },
          { label: "Docs", value: "210 MB", color: "var(--success)" },
          { label: "Other", value: "170 MB", color: "var(--muted-foreground)" },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border border-border bg-surface-2 p-3">
            <div className="mx-auto mb-1.5 h-1.5 w-6 rounded-full" style={{ background: s.color }} />
            <p className="text-[13px] font-medium text-foreground">{s.value}</p>
            <p className="text-[11px] text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
