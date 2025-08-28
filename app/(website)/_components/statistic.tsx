export const Statistic = ({
  value,
  label,
}: { value: number | null; label: string }) => (
  <div className="text-gray-400">
    <h3 className="text-4xl lg:text-5xl font-bold text-center">
      {value}
      <span className="text-primary-500">+</span>
    </h3>
    <p className="text-base text-center mt-2 font-medium capitalize">{label}</p>
  </div>
);
