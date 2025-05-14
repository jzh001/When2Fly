function LoginButton() {
  function handleGoogleLogin() {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    const redirectUri = import.meta.env.VITE_GOOGLE_REDIRECT_URI;
    const scope = "email profile";
    const responseType = "code";
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=${responseType}&scope=${scope}`;

    window.location.href = authUrl;
  }

  return (
    <>
      <button onClick={handleGoogleLogin}>Login with Google</button>
    </>
  );
}

export default LoginButton;
