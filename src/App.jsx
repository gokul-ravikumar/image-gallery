import { useEffect, useState } from "react";
import { request } from "./api.js";
import Login from "./Login.jsx";
import Register from "./Register.jsx";
import Gallery from "./Gallery.jsx";

function App() {
  const [user, setUser] = useState(null);
  const [checkingSession, setCheckingSession] = useState(true);
  const [view, setView] = useState("login"); // "login" | "register"
  const [notice, setNotice] = useState("");

  // On page load, ask the backend who we are. If the JWT cookie is still
  // valid, /auth/me returns the user and we stay logged in after a refresh.
  useEffect(() => {
    request("/auth/me")
      .then((data) => setUser(data.user))
      .catch(() => setUser(null))
      .finally(() => setCheckingSession(false));
  }, []);

  if (checkingSession) {
    return <p>Loading...</p>;
  }

  if (user) {
    return (
      <Gallery
        user={user}
        onLogout={() => {
          setUser(null);
          setNotice("");
          setView("login");
        }}
      />
    );
  }

  if (view === "register") {
    return (
      <Register
        onSwitchToLogin={(message) => {
          setNotice(message);
          setView("login");
        }}
      />
    );
  }

  return (
    <Login
      notice={notice}
      onLogin={(loggedInUser) => setUser(loggedInUser)} // "redirect" to gallery
      onSwitchToRegister={() => {
        setNotice("");
        setView("register");
      }}
    />
  );
}

export default App;
