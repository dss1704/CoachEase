import Link from "next/link";

export default function Login() {
  return (
    <main>
      <h1>Login</h1>

      <input placeholder="Email" />

      <br />
      <br />

      <input type="password" placeholder="Password" />

      <br />
      <br />

      <Link href="/dashboard">
        <button>Log In</button>
      </Link>
    </main>
  );
}