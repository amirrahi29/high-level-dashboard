import '../../styles/page-loader.css';

export default function PageLoader({ label = 'Loading…' }) {
  return (
    <div className="def-page-loader" role="status" aria-live="polite" aria-busy="true">
      <div className="def-page-loader-spinner" aria-hidden="true" />
      <span>{label}</span>
    </div>
  );
}
