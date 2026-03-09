import { useNavigate, useLocation } from "react-router-dom";

const tabs = [
  { key: "this-week", label: "This Week", emoji: "📅", path: "/meal-plan" },
  { key: "vault", label: "Vault", emoji: "⭐", path: "/vault" },
];

const BottomTabBar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 flex h-16 items-center border-t border-border bg-card safe-area-bottom">
      {tabs.map((tab) => {
        const isActive = location.pathname === tab.path;
        return (
          <button
            key={tab.key}
            onClick={() => navigate(tab.path)}
            className={`flex flex-1 flex-col items-center justify-center gap-0.5 transition-colors ${
              isActive ? "text-primary" : "text-muted-foreground"
            }`}
          >
            <span className="text-lg">{tab.emoji}</span>
            <span className="text-xs font-medium">{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
};

export default BottomTabBar;
