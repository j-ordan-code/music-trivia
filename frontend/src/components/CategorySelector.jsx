import { getCategoryStyle } from "../categoryStyles";

export default function CategorySelector({ categories, onSelect }) {
  return (
    <div className="category-grid">
      {categories.map((cat) => {
        const { color, icon: Icon } = getCategoryStyle(cat.id);
        return (
          <button
            key={cat.id}
            className="category-card"
            style={{
              "--card-accent": color,
              backgroundImage: cat.imageUrl
                ? `linear-gradient(${color}, ${color}), url(${cat.imageUrl})`
                : `linear-gradient(${color}, ${color})`
            }}
            onClick={() => onSelect(cat.id)}
          >
            <Icon className="category-card-icon" size={20} strokeWidth={2} />
            <span className="category-card-label">{cat.label}</span>
          </button>
        );
      })}
    </div>
  );
}
