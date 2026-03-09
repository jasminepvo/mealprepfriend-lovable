import { useNavigate, useLocation } from "react-router-dom";

const tabs = [
  { key: "this-week", label: "This Week", emoji: "📅", path: "/meal-plan" },
  { key: "vault", label: "Vault", emoji: "⭐", path: "/vault" },
];

const FloatingTabBar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <nav className="fixed bottom-4 left-1/2 z-30 -translate-x-1/2 safe-area-bottom">
      <div
        className="flex items-center rounded-full px-2 py-1"
        style={{
          width: "70vw",
          background: "rgba(255, 255, 255, 0.15)",
          backdropFilter: "blur(20px) saturate(180%)",
          WebkitBackdropFilter: "blur(20px) saturate(180%)",
          border: "1px solid rgba(255, 255, 255, 0.3)",
          boxShadow:
            "0 8px 32px rgba(0, 0, 0, 0.12), 0 2px 8px rgba(0, 0, 0, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.4)",
        }}
      >
        {tabs.map((tab) => {
          const isActive = location.pathname === tab.path;
          return (
            <button
              key={tab.key}
              onClick={() => navigate(tab.path)}
              className={`relative flex flex-1 flex-col items-center justify-center gap-0.5 rounded-full py-3 transition-all ${
                isActive ? "text-primary" : "text-muted-foreground"
              }`}
            >
              {isActive && (
                <span
                  className="absolute inset-0 rounded-full"
                  style={{
                    background: "hsl(var(--primary) / 0.2)",
                    boxShadow: "0 4px 12px hsl(var(--primary) / 0.3)",
                  }}
                />
              )}
              <span className="relative text-lg">{tab.emoji}</span>
              <span className="relative text-xs font-medium">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default FloatingTabBar;
