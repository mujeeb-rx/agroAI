import { SIDEBAR_ITEMS } from "../theme.js";
import { t } from "../translations.js";

export default function Sidebar({ page, setPage, dark, bg, collapsed, setCollapsed, lang }) {
  const isDark = bg.bg === "#0a1a0f";

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          height: "100vh",
          width: collapsed ? 70 : 260,
          background: bg.sidebar,
          backdropFilter: "blur(20px)",
          borderRight: `1px solid ${bg.border}`,
          display: "flex",
          flexDirection: "column",
          zIndex: 200,
          transition: "width 0.3s cubic-bezier(0.4,0,0.2,1)",
          overflow: "hidden",
        }}
        className="desktop-sidebar"
      >
        {/* Logo */}
        <div
          style={{
            padding: collapsed ? "20px 0" : "24px 20px 16px",
            display: "flex",
            alignItems: "center",
            gap: 10,
            justifyContent: collapsed ? "center" : "space-between",
            borderBottom: `1px solid ${bg.border}`,
            cursor: "pointer",
          }}
          onClick={() => setPage("dashboard")}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 28, flexShrink: 0 }}>🌿</span>
            {!collapsed && (
              <div>
                <div style={{ fontSize: 18, fontWeight: 900, color: bg.accent, letterSpacing: -0.5 }}>AgroAI</div>
                <div style={{ fontSize: 10, color: bg.muted, fontWeight: 600, letterSpacing: 0.5 }}>Smart Farming Platform</div>
              </div>
            )}
          </div>
          {!collapsed && (
            <button
              onClick={(e) => { e.stopPropagation(); setCollapsed(true); }}
              style={{ background: "none", border: "none", color: bg.muted, cursor: "pointer", fontSize: 16, padding: 4 }}
              title="Collapse sidebar"
            >◀</button>
          )}
        </div>

        {/* Expand button when collapsed */}
        {collapsed && (
          <button
            onClick={() => setCollapsed(false)}
            style={{
              background: "none", border: "none", color: bg.muted,
              cursor: "pointer", fontSize: 16, padding: "10px 0",
              width: "100%", display: "flex", justifyContent: "center",
            }}
            title="Expand sidebar"
          >▶</button>
        )}

        {/* Navigation Items */}
        <nav style={{ flex: 1, overflowY: "auto", overflowX: "hidden", padding: "12px 0" }}>
          {SIDEBAR_ITEMS.map((item) => {
            const isActive = page === item.key;
            const label = t(lang, "nav", item.key);
            return (
              <button
                key={item.key}
                onClick={() => setPage(item.key)}
                title={collapsed ? label : ""}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: collapsed ? 0 : 12,
                  padding: collapsed ? "12px 0" : "11px 20px",
                  width: "100%",
                  background: isActive ? bg.navActive : "transparent",
                  border: "none",
                  borderLeft: isActive ? `3px solid ${bg.accent}` : "3px solid transparent",
                  borderRadius: collapsed ? 0 : "0 12px 12px 0",
                  cursor: "pointer",
                  color: isActive ? bg.accent : bg.muted,
                  fontSize: 14,
                  fontWeight: isActive ? 700 : 500,
                  fontFamily: "inherit",
                  transition: "all 0.2s",
                  marginBottom: 2,
                  justifyContent: collapsed ? "center" : "flex-start",
                  position: "relative",
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = isDark ? "rgba(76,175,80,0.08)" : "rgba(46,125,50,0.05)";
                    e.currentTarget.style.color = bg.accent;
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = "transparent";
                    e.currentTarget.style.color = bg.muted;
                  }
                }}
              >
                <span style={{ fontSize: 18, flexShrink: 0, width: collapsed ? "100%" : "auto", textAlign: collapsed ? "center" : "left" }}>
                  {item.icon}
                </span>
                {!collapsed && (
                  <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {label}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Bottom info */}
        {!collapsed && (
          <div style={{ padding: "16px 20px", borderTop: `1px solid ${bg.border}` }}>
            <div style={{ fontSize: 11, color: bg.muted, marginBottom: 8, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.6 }}>
              Powered by Gemini AI
            </div>
            <div style={{ fontSize: 11, color: bg.muted, opacity: 0.6 }}>
              🌾 Smart Farming Platform v2.0
            </div>
          </div>
        )}
      </aside>
    </>
  );
}
