import { useEffect, useState } from "react";

import {
    getOrders,
    updateStatus,
    recordPurchase,
} from "../../services/orderService";

import {
    getDashboard,
    getDeliveryPartners,
    assignDeliveryPartner,
} from "../../services/adminService";

import StatusBadge from "../../components/StatusBadge";

import {
    ArrowRight,
    Boxes,
    ChartNoAxesCombined,
    Clock3,
    PackageCheck,
    ShoppingBasket,
    Truck,
} from "lucide-react";

import { useAuth } from "../../context/AuthContext";

const iconFor = {
    BUYER_ASSIGNED: ShoppingBasket,
    SHOPPING_IN_PROGRESS: ShoppingBasket,
    ITEMS_PURCHASED: PackageCheck,
    AT_PACKING_POINT: PackageCheck,
    PACKING: Boxes,
    READY_FOR_PICKUP: PackageCheck,
    DELIVERY_ASSIGNED: Truck,
    PICKED_UP: Truck,
    OUT_FOR_DELIVERY: Truck,
    DELIVERED: PackageCheck,
};

export default function Operations() {
    const { user } = useAuth();

    const [orders, setOrders] = useState([]);
    const [stats, setStats] = useState(null);

    const [purchaseOrder, setPurchaseOrder] = useState(null);
    const [purchaseRecords, setPurchaseRecords] = useState({});

    const [deliveryPartners, setDeliveryPartners] = useState([]);
    const [assignmentOrder, setAssignmentOrder] = useState(null);
    const [selectedPartner, setSelectedPartner] = useState("");

    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);

    async function load() {
        try {
            const r = await getOrders();
            setOrders(r.data.orders || []);

            if (user.role === "admin") {
                const dashboard = await getDashboard();
                setStats(dashboard.data.stats);

                const partnersResponse = await getDeliveryPartners();
                setDeliveryPartners(
                    partnersResponse.data.partners || []
                );
            }
        } catch (error) {
            setMessage(
                error.response?.data?.message ||
                    "Failed to load orders."
            );
        }
    }

    useEffect(() => {
        load();
    }, []);

    /*
     * MARKET BUYER
     */

    function openPurchaseForm(order) {
        const records = {};

        order.items?.forEach((item) => {
            records[item.productId] = {
                productId: item.productId,
                purchasedQuantity: item.quantity || 0,
                marketPrice: item.estimatedPrice || 0,
                availabilityStatus: "AVAILABLE",
            };
        });

        setPurchaseRecords(records);
        setPurchaseOrder(order);
        setMessage("");
    }

    function updatePurchaseRecord(productId, field, value) {
        setPurchaseRecords((current) => ({
            ...current,
            [productId]: {
                ...current[productId],
                [field]: value,
            },
        }));
    }

    async function submitPurchase() {
        if (!purchaseOrder) return;

        setLoading(true);
        setMessage("");

        try {
            const records = Object.values(purchaseRecords).map(
                (record) => ({
                    productId: record.productId,
                    purchasedQuantity: Number(
                        record.purchasedQuantity
                    ),
                    marketPrice: Number(record.marketPrice),
                    availabilityStatus:
                        record.availabilityStatus,
                })
            );

            await recordPurchase(purchaseOrder._id, {
                records,
            });

            setPurchaseOrder(null);
            setPurchaseRecords({});

            setMessage(
                "Purchase details recorded successfully."
            );

            await load();
        } catch (error) {
            setMessage(
                error.response?.data?.message ||
                    "Failed to record purchase details."
            );
        } finally {
            setLoading(false);
        }
    }

    /*
     * DELIVERY PARTNER ASSIGNMENT
     */

    function openAssignment(order) {
        setAssignmentOrder(order);
        setSelectedPartner("");
        setMessage("");
    }

    async function handleAssignDelivery() {
        if (!assignmentOrder || !selectedPartner) {
            setMessage("Please select a delivery partner.");
            return;
        }

        setLoading(true);
        setMessage("");

        try {
            await assignDeliveryPartner(
                assignmentOrder._id,
                selectedPartner
            );

            setAssignmentOrder(null);
            setSelectedPartner("");

            setMessage(
                "Delivery partner assigned successfully."
            );

            await load();
        } catch (error) {
            setMessage(
                error.response?.data?.message ||
                    "Failed to assign delivery partner."
            );
        } finally {
            setLoading(false);
        }
    }

    /*
     * STATUS TRANSITIONS
     */

    async function advance(order) {
        let status = null;

        if (user.role === "market_buyer") {
            if (order.status === "BUYER_ASSIGNED") {
                status = "SHOPPING_IN_PROGRESS";
            } else if (order.status === "ITEMS_PURCHASED") {
                status = "AT_PACKING_POINT";
            }
        }

        if (user.role === "packing_staff") {
            if (order.status === "AT_PACKING_POINT") {
                status = "PACKING";
            } else if (order.status === "PACKING") {
                status = "READY_FOR_PICKUP";
            }
        }

        if (user.role === "delivery_partner") {
            if (order.status === "DELIVERY_ASSIGNED") {
                status = "PICKED_UP";
            } else if (order.status === "PICKED_UP") {
                status = "OUT_FOR_DELIVERY";
            } else if (order.status === "OUT_FOR_DELIVERY") {
                status = "DELIVERED";
            }
        }

        if (!status) return;

        try {
            setLoading(true);

            await updateStatus(order._id, {
                status,
                note: `Updated by ${user.role}`,
            });

            await load();
        } catch (error) {
            setMessage(
                error.response?.data?.message ||
                    "Failed to update order status."
            );
        } finally {
            setLoading(false);
        }
    }

    /*
     * BUTTON TEXT
     */

    function getAction(order) {
        if (user.role === "market_buyer") {
            if (order.status === "BUYER_ASSIGNED") {
                return "Start shopping";
            }

            if (order.status === "SHOPPING_IN_PROGRESS") {
                return "Record purchase";
            }

            if (order.status === "ITEMS_PURCHASED") {
                return "Send to packing";
            }
        }

        if (user.role === "packing_staff") {
            if (order.status === "AT_PACKING_POINT") {
                return "Start packing";
            }

            if (order.status === "PACKING") {
                return "Ready for pickup";
            }
        }

        if (user.role === "delivery_partner") {
            if (order.status === "DELIVERY_ASSIGNED") {
                return "Pick up";
            }

            if (order.status === "PICKED_UP") {
                return "Out for delivery";
            }

            if (order.status === "OUT_FOR_DELIVERY") {
                return "Mark delivered";
            }
        }

        return null;
    }

    function handleAction(order) {
        if (
            user.role === "market_buyer" &&
            order.status === "SHOPPING_IN_PROGRESS"
        ) {
            openPurchaseForm(order);
            return;
        }

        advance(order);
    }

    return (
        <div className="page">
            <div className="page-title">
                <div>
                    <span className="eyebrow">
                        {user.role === "admin"
                            ? "Control room"
                            : "Your workspace"}
                    </span>

                    <h1>
                        Good morning,{" "}
                        {user.name?.split(" ")[0]}.
                    </h1>

                    <p>
                        Here’s what needs your attention today.
                    </p>
                </div>
            </div>

            {message && (
                <div
                    style={{
                        marginBottom: "20px",
                        padding: "12px 16px",
                        borderRadius: "8px",
                        background: "#f5f5f5",
                    }}
                >
                    {message}
                </div>
            )}

            {stats && (
                <div className="metric-grid">
                    <Metric
                        label="Total orders"
                        value={stats.orders}
                        icon={ChartNoAxesCombined}
                    />

                    <Metric
                        label="Pending"
                        value={stats.pending}
                        icon={Clock3}
                    />

                    <Metric
                        label="Customers"
                        value={stats.customers}
                        icon={ShoppingBasket}
                    />

                    <Metric
                        label="Revenue"
                        value={`₹${stats.revenue}`}
                        icon={PackageCheck}
                    />
                </div>
            )}

            <div className="section-heading operations-heading">
                <div>
                    <span className="eyebrow">Live queue</span>
                    <h2>Orders needing action</h2>
                </div>

                <span className="queue-count">
                    {orders.length} active
                </span>
            </div>

            <div className="operations-list">
                {orders.map((order) => {
                    const Icon =
                        iconFor[order.status] ||
                        ShoppingBasket;

                    const action = getAction(order);

                    return (
                        <div
                            className="operation-card"
                            key={order._id}
                        >
                            <div className="operation-icon">
                                <Icon size={21} />
                            </div>

                            <div className="operation-main">
                                <span className="eyebrow">
                                    #
                                    {order._id
                                        .slice(-7)
                                        .toUpperCase()}
                                </span>

                                <h3>
                                    {order.items?.length} items ·{" "}
                                    {order.customerId?.name ||
                                        "Customer"}
                                </h3>

                                <p>
                                    {order.marketId?.name ||
                                        "Market"}{" "}
                                    ·{" "}
                                    {new Date(
                                        order.createdAt
                                    ).toLocaleTimeString(
                                        "en-IN",
                                        {
                                            hour: "2-digit",
                                            minute: "2-digit",
                                        }
                                    )}
                                </p>
                            </div>

                            <StatusBadge
                                status={order.status}
                            />

                            {user.role === "admin" &&
                                order.status ===
                                    "READY_FOR_PICKUP" && (
                                    <button
                                        className="secondary-button"
                                        onClick={() =>
                                            openAssignment(
                                                order
                                            )
                                        }
                                    >
                                        Assign delivery
                                        <ArrowRight size={15} />
                                    </button>
                                )}

                            {user.role !== "admin" &&
                                action && (
                                    <button
                                        className="secondary-button"
                                        onClick={() =>
                                            handleAction(
                                                order
                                            )
                                        }
                                    >
                                        {action}
                                        <ArrowRight size={15} />
                                    </button>
                                )}
                        </div>
                    );
                })}
            </div>

            {!orders.length && (
                <div className="empty-state">
                    <h2>All clear</h2>
                    <p>
                        There are no orders waiting in your
                        queue.
                    </p>
                </div>
            )}

            {purchaseOrder && (
                <PurchaseModal
                    order={purchaseOrder}
                    records={purchaseRecords}
                    loading={loading}
                    onChange={updatePurchaseRecord}
                    onClose={() => {
                        setPurchaseOrder(null);
                        setPurchaseRecords({});
                    }}
                    onSubmit={submitPurchase}
                />
            )}

            {assignmentOrder && (
                <DeliveryAssignmentModal
                    order={assignmentOrder}
                    partners={deliveryPartners}
                    selectedPartner={selectedPartner}
                    loading={loading}
                    onChange={setSelectedPartner}
                    onClose={() => {
                        setAssignmentOrder(null);
                        setSelectedPartner("");
                    }}
                    onSubmit={handleAssignDelivery}
                />
            )}
        </div>
    );
}

function PurchaseModal({
    order,
    records,
    loading,
    onChange,
    onClose,
    onSubmit,
}) {
    return (
        <div className="modal-overlay">
            <div className="modal-card">
                <div className="modal-header">
                    <div>
                        <span className="eyebrow">
                            Market purchase
                        </span>

                        <h2>
                            Order #
                            {order._id
                                .slice(-7)
                                .toUpperCase()}
                        </h2>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                    >
                        Close
                    </button>
                </div>

                {order.items?.map((item) => {
                    const record =
                        records[item.productId] || {};

                    return (
                        <div
                            key={item.productId}
                            className="purchase-item"
                        >
                            <h3>{item.name}</h3>

                            <p>
                                Customer requested:{" "}
                                <strong>
                                    {item.quantity}{" "}
                                    {item.unit}
                                </strong>
                            </p>

                            <div className="purchase-fields">
                                <div>
                                    <label>
                                        Purchased Quantity
                                    </label>

                                    <input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={
                                            record.purchasedQuantity ??
                                            ""
                                        }
                                        onChange={(e) =>
                                            onChange(
                                                item.productId,
                                                "purchasedQuantity",
                                                e.target.value
                                            )
                                        }
                                    />
                                </div>

                                <div>
                                    <label>
                                        Market Price
                                    </label>

                                    <input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={
                                            record.marketPrice ??
                                            ""
                                        }
                                        onChange={(e) =>
                                            onChange(
                                                item.productId,
                                                "marketPrice",
                                                e.target.value
                                            )
                                        }
                                    />
                                </div>

                                <div>
                                    <label>
                                        Availability
                                    </label>

                                    <select
                                        value={
                                            record.availabilityStatus ||
                                            "AVAILABLE"
                                        }
                                        onChange={(e) =>
                                            onChange(
                                                item.productId,
                                                "availabilityStatus",
                                                e.target.value
                                            )
                                        }
                                    >
                                        <option value="AVAILABLE">
                                            Available
                                        </option>

                                        <option value="PARTIAL">
                                            Partially Available
                                        </option>

                                        <option value="UNAVAILABLE">
                                            Unavailable
                                        </option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    );
                })}

                <div className="modal-actions">
                    <button
                        type="button"
                        onClick={onClose}
                    >
                        Cancel
                    </button>

                    <button
                        type="button"
                        className="primary-button"
                        onClick={onSubmit}
                        disabled={loading}
                    >
                        {loading
                            ? "Saving..."
                            : "Record Purchase"}
                    </button>
                </div>
            </div>
        </div>
    );
}

function DeliveryAssignmentModal({
    order,
    partners,
    selectedPartner,
    loading,
    onChange,
    onClose,
    onSubmit,
}) {
    return (
        <div className="modal-overlay">
            <div className="modal-card assignment-modal">
                <div className="modal-header">
                    <div>
                        <span className="eyebrow">
                            Delivery assignment
                        </span>

                        <h2>
                            Order #
                            {order._id
                                .slice(-7)
                                .toUpperCase()}
                        </h2>

                        <p>
                            Select an active delivery partner
                            for this order.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                    >
                        Close
                    </button>
                </div>

                {partners.length === 0 ? (
                    <div className="empty-state">
                        <h3>
                            No delivery partners available
                        </h3>

                        <p>
                            There are currently no active
                            delivery partners.
                        </p>
                    </div>
                ) : (
                    <div className="assignment-form">
                        <label>
                            Delivery Partner
                        </label>

                        <select
                            value={selectedPartner}
                            onChange={(e) =>
                                onChange(e.target.value)
                            }
                        >
                            <option value="">
                                Select delivery partner
                            </option>

                            {partners.map((partner) => (
                                <option
                                    key={partner._id}
                                    value={partner._id}
                                >
                                    {partner.name}
                                    {partner.phone
                                        ? ` · ${partner.phone}`
                                        : ""}
                                </option>
                            ))}
                        </select>
                    </div>
                )}

                <div className="modal-actions">
                    <button
                        type="button"
                        onClick={onClose}
                    >
                        Cancel
                    </button>

                    <button
                        type="button"
                        className="primary-button"
                        onClick={onSubmit}
                        disabled={
                            loading ||
                            !selectedPartner ||
                            partners.length === 0
                        }
                    >
                        {loading
                            ? "Assigning..."
                            : "Assign Partner"}
                    </button>
                </div>
            </div>
        </div>
    );
}

function Metric({ label, value, icon: Icon }) {
    return (
        <div className="metric">
            <span className="metric-icon">
                <Icon size={18} />
            </span>

            <div>
                <small>{label}</small>
                <strong>{value}</strong>
            </div>
        </div>
    );
}