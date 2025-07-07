import Link from 'next/link';

export default function Home() {
  return (
    <main>
      <h1>Welcome to Apocalypse 2033</h1>
      <ul>
        <li><Link href="/en/chapter-1">Read in English</Link></li>
        <li><Link href="/ru/chapter-1">Read in Russian</Link></li>
      </ul>
    </main>
  );
}
