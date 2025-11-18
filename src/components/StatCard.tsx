type Props = {
  title: string;
  value: string | number;
  description?: string;
};

export default function StatCard({ title, value, description }: Props) {
  return (
    <div className="card">
      <div className="stat-title">{title}</div>
      <div className="stat-value">{value}</div>
      {description ? <div className="muted">{description}</div> : null}
    </div>
  );
}
