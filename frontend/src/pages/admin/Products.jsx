import { useEffect, useState } from "react";
import api from "../../services/api";

const emptyForm = {
    name: "",
    description: "",
    category: "Vegetables",
    unit: "kg",
    estimatedPrice: "",
    emoji: "",
};

export default function Products() {
    const [form, setForm] = useState(emptyForm);
    const [products, setProducts] = useState([]);
    const [message, setMessage] = useState("");
    const [editingId, setEditingId] = useState(null);
    const [loading, setLoading] = useState(true);

    const loadProducts = async () => {
        try {
            const response = await api.get("/products");
            setProducts(response.data.products || []);
        } catch (error) {
            setMessage(
                error.response?.data?.message || "Failed to load products."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadProducts();
    }, []);

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage("");

        try {
            const productData = {
                ...form,
                estimatedPrice: Number(form.estimatedPrice),
                available: true,
            };

            if (editingId) {
                await api.put(`/products/${editingId}`, productData);
                setMessage("Product updated successfully!");
            } else {
                await api.post("/products", productData);
                setMessage("Product added successfully!");
            }

            setForm(emptyForm);
            setEditingId(null);
            await loadProducts();
        } catch (error) {
            setMessage(
                error.response?.data?.message || "Something went wrong."
            );
        }
    };

    const handleEdit = (product) => {
        setEditingId(product._id);

        setForm({
            name: product.name || "",
            description: product.description || "",
            category: product.category || "Vegetables",
            unit: product.unit || "kg",
            estimatedPrice: product.estimatedPrice || "",
            emoji: product.emoji || "",
        });

        setMessage("");
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const handleDelete = async (id) => {
        const confirmed = window.confirm(
            "Are you sure you want to delete this product?"
        );

        if (!confirmed) {
            return;
        }

        try {
            await api.delete(`/products/${id}`);

            setMessage("Product deleted successfully!");

            if (editingId === id) {
                setEditingId(null);
                setForm(emptyForm);
            }

            await loadProducts();
        } catch (error) {
            setMessage(
                error.response?.data?.message || "Failed to delete product."
            );
        }
    };

    const cancelEdit = () => {
        setEditingId(null);
        setForm(emptyForm);
        setMessage("");
    };

    return (
        <div className="page">
            <div className="page-title">
                <div>
                    <span className="eyebrow">Admin</span>
                    <h1>{editingId ? "Edit Product" : "Add Product"}</h1>
                    <p>
                        {editingId
                            ? "Update product information."
                            : "Add a new fruit or vegetable to LocalHarvest."}
                    </p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="product-form">
                <div>
                    <label>Product Name</label>
                    <input
                        type="text"
                        name="name"
                        value={form.name}
                        onChange={handleChange}
                        placeholder="Example: Cucumber"
                        required
                    />
                </div>

                <div>
                    <label>Category</label>
                    <select
                        name="category"
                        value={form.category}
                        onChange={handleChange}
                    >
                        <option value="Vegetables">Vegetables</option>
                        <option value="Fruits">Fruits</option>
                    </select>
                </div>

                <div>
                    <label>Unit</label>
                    <select
                        name="unit"
                        value={form.unit}
                        onChange={handleChange}
                    >
                        <option value="kg">kg</option>
                        <option value="gram">gram</option>
                        <option value="piece">piece</option>
                        <option value="dozen">dozen</option>
                        <option value="bundle">bundle</option>
                    </select>
                </div>

                <div>
                    <label>Estimated Price</label>
                    <input
                        type="number"
                        name="estimatedPrice"
                        value={form.estimatedPrice}
                        onChange={handleChange}
                        placeholder="Example: 35"
                        min="0"
                        required
                    />
                </div>

                <div>
                    <label>Emoji</label>
                    <input
                        type="text"
                        name="emoji"
                        value={form.emoji}
                        onChange={handleChange}
                        placeholder="Example: 🥒"
                    />
                </div>

                <div>
                    <label>Description</label>
                    <textarea
                        name="description"
                        value={form.description}
                        onChange={handleChange}
                        placeholder="Fresh cucumbers sourced from a nearby market."
                        rows="4"
                    />
                </div>

                <button type="submit">
                    {editingId ? "Update Product" : "Add Product"}
                </button>

                {editingId && (
                    <button
                        type="button"
                        onClick={cancelEdit}
                    >
                        Cancel Edit
                    </button>
                )}

                {message && <p>{message}</p>}
            </form>

            <div style={{ marginTop: "40px" }}>
                <h2>Products</h2>

                {loading ? (
                    <p>Loading products...</p>
                ) : products.length === 0 ? (
                    <p>No products found.</p>
                ) : (
                    <div>
                        {products.map((product) => (
                            <div
                                key={product._id}
                                style={{
                                    border: "1px solid #ddd",
                                    padding: "15px",
                                    marginBottom: "10px",
                                    borderRadius: "8px",
                                }}
                            >
                                <div>
                                    <strong>
                                        {product.emoji} {product.name}
                                    </strong>
                                </div>

                                <p>
                                    {product.category} · ₹
                                    {product.estimatedPrice} / {product.unit}
                                </p>

                                <p>
                                    {product.description}
                                </p>

                                <button
                                    type="button"
                                    onClick={() => handleEdit(product)}
                                >
                                    Edit
                                </button>

                                <button
                                    type="button"
                                    onClick={() =>
                                        handleDelete(product._id)
                                    }
                                    style={{ marginLeft: "10px" }}
                                >
                                    Delete
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}