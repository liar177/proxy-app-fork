function FilterBar({ filter, onFilterChange }) {
  const filters = [
    { key: 'all', label: '全部' },
    { key: 'active', label: '待完成' },
    { key: 'completed', label: '已完成' },
  ];

  return (
    <div className="filter-bar">
      {filters.map(({ key, label }) => (
        <button
          key={key}
          className={`filter-btn ${filter === key ? 'active' : ''}`}
          onClick={() => onFilterChange(key)}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

export default FilterBar;