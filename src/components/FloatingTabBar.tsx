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
        className="floating-tab-bar flex items-center rounded-full px-2 py-1"
        style={{ width: "70vw" }}
      >
        {tabs.map((tab) => {
          const isActive = location.pathname === tab.path;
          return (
             <button
              key={tab.key}
              onClick={() => navigate(tab.path)}
              className={`relative flex flex-1 flex-col items-center justify-center rounded-full transition-all ${
                isActive ? "text-primary" : "text-muted-foreground"
              }`}
              style={{ height: 40 }}
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
