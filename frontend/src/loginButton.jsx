function LoginButton() {
  function handleGoogleLogin() {
    const clientId =
      "762586867173-473jtgbncbr7i2mc13p47h7gk4vqfo5l.apps.googleusercontent.com";
    const redirectUri = "http://localhost:5173/callback";
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
