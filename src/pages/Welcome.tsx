import { useNavigate } from "react-router-dom";

const Welcome = () => {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-6 text-center">
      <div className="mb-8">
        <span className="text-5xl">🥗</span>
      </div>
      <h1 className="mb-4 text-4xl font-bold text-foreground">
        MealPrepFriend
      </h1>
      <p className="mb-12 text-lg text-muted-foreground max-w-xs">
        Your weekly meal prep, done in one Sunday.
      </p>
      <button
        onClick={() => navigate("/goals")}
        className="w-full max-w-xs rounded-lg bg-primary px-6 py-4 text-lg font-semibold text-primary-foreground shadow-md active:scale-[0.98] transition-transform"
      >
        Let's get started →
      </button>
    </div>
  );
};

export default Welcome;
