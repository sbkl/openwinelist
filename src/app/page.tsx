function WineGlass() {
  return (
    <svg viewBox="0 0 34 34" fill="none" aria-hidden="true">
      <path
        d="M8.5 4h17l-1.4 9.1a7.18 7.18 0 0 1-14.2 0L8.5 4Z"
        stroke="currentColor"
        strokeWidth="1.4"
      />
      <path
        d="M10.4 11.5h13.2M17 20.2V29M12.2 30h9.6"
        stroke="currentColor"
        strokeWidth="1.4"
      />
      <path
        d="M10.7 10h12.6l-.5 3.1a5.87 5.87 0 0 1-11.6 0l-.5-3.1Z"
        fill="currentColor"
      />
    </svg>
  );
}

export default function Home() {
  return (
    <main className="page" id="top">
      <header>
        <a className="brand" href="#top" aria-label="Open Wine List home">
          <span className="mark">
            <WineGlass />
          </span>
          <span>Open Wine List</span>
        </a>
        <span className="status">
          <i />
          In the works
        </span>
      </header>

      <section className="hero">
        <p className="eyebrow">A FREE, OPEN API FOR WINE</p>
        <h1>
          From wine producers to the professionals who tell their stories.
        </h1>
        <p className="intro">One open list, made for everyone.</p>
        <a
          className="contact"
          href="https://mail.google.com/mail/?view=cm&fs=1&to=sebastien%40sbkl.ltd"
          target="_blank"
          rel="noreferrer"
        >
          Say hello <span>↗</span>
        </a>
      </section>

      <footer>
        <span>openwinelist.com</span>
        <span>© {new Date().getFullYear()}</span>
      </footer>
    </main>
  );
}
