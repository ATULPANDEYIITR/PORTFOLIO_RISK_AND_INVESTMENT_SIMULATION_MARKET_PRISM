import { useEffect, useMemo, useReducer, useState } from "react";
import axios from "axios";
import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  Bell,
  BookOpen,
  BriefcaseBusiness,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  CircleDollarSign,
  Clock3,
  Eye,
  Gauge,
  GraduationCap,
  LayoutDashboard,
  LineChart,
  ListFilter,
  Lock,
  Menu,
  Newspaper,
  PanelLeft,
  Play,
  Plus,
  RefreshCw,
  Search,
  Settings,
  ShieldCheck,
  Star,
  Target,
  Trash2,
  TrendingDown,
  TrendingUp,
  Wallet,
  X,
  Zap,
} from "lucide-react";

import "./App.css";

const API_BASE = "http://localhost:8000/api";

const FALLBACK_STOCKS = [
  {
    symbol: "RELIANCE",
    company: "Reliance Industries",
    exchange: "NSE",
    price: 2925.4,
    change: 35.6,
    change_percent: 1.23,
    market_cap: "19.80T",
    sector: "Energy",
  },
  {
    symbol: "TCS",
    company: "Tata Consultancy Services",
    exchange: "NSE",
    price: 4185.25,
    change: 42.15,
    change_percent: 1.02,
    market_cap: "15.10T",
    sector: "IT",
  },
  {
    symbol: "HDFCBANK",
    company: "HDFC Bank",
    exchange: "NSE",
    price: 1742.8,
    change: -12.4,
    change_percent: -0.71,
    market_cap: "13.30T",
    sector: "Banking",
  },
  {
    symbol: "INFY",
    company: "Infosys",
    exchange: "NSE",
    price: 1925.6,
    change: 28.35,
    change_percent: 1.49,
    market_cap: "7.90T",
    sector: "IT",
  },
  {
    symbol: "ICICIBANK",
    company: "ICICI Bank",
    exchange: "NSE",
    price: 1385.45,
    change: 18.2,
    change_percent: 1.33,
    market_cap: "9.70T",
    sector: "Banking",
  },
  {
    symbol: "SBIN",
    company: "State Bank of India",
    exchange: "NSE",
    price: 825.3,
    change: -4.25,
    change_percent: -0.51,
    market_cap: "7.30T",
    sector: "Banking",
  },
];

const FALLBACK_INDICES = [
  {
    name: "NIFTY 50",
    exchange: "NSE",
    value: 24580.35,
    change: 185.4,
    change_percent: 0.76,
    status: "up",
  },
  {
    name: "SENSEX",
    exchange: "BSE",
    value: 80512.18,
    change: 542.6,
    change_percent: 0.68,
    status: "up",
  },
  {
    name: "NIFTY BANK",
    exchange: "NSE",
    value: 52640.25,
    change: -125.3,
    change_percent: -0.24,
    status: "down",
  },
  {
    name: "NIFTY IT",
    exchange: "NSE",
    value: 42180.7,
    change: 310.25,
    change_percent: 0.74,
    status: "up",
  },
];

const FALLBACK_SECTORS = [
  {
    name: "Information Technology",
    short_name: "IT",
    performance: 1.42,
    status: "up",
  },
  {
    name: "Banking",
    short_name: "BANK",
    performance: -0.35,
    status: "down",
  },
  {
    name: "Pharmaceuticals",
    short_name: "PHARMA",
    performance: 0.82,
    status: "up",
  },
  {
    name: "Automobile",
    short_name: "AUTO",
    performance: 1.15,
    status: "up",
  },
  {
    name: "Energy",
    short_name: "ENERGY",
    performance: 0.64,
    status: "up",
  },
  {
    name: "FMCG",
    short_name: "FMCG",
    performance: -0.18,
    status: "down",
  },
];

const NAV_ITEMS = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
  },
  {
    id: "trade",
    label: "Trade",
    icon: LineChart,
  },
  {
    id: "markets",
    label: "Markets",
    icon: BarChart3,
  },
  {
    id: "portfolio",
    label: "Portfolio",
    icon: BriefcaseBusiness,
  },
  {
    id: "orders",
    label: "Orders",
    icon: ListFilter,
  },
  {
    id: "watchlist",
    label: "Watchlist",
    icon: Eye,
  },
  {
    id: "dom",
    label: "Market Depth",
    icon: Activity,
  },
  {
    id: "tape",
    label: "Time & Sales",
    icon: Zap,
  },
  {
    id: "options",
    label: "Options",
    icon: Target,
  },
  {
    id: "news",
    label: "News",
    icon: Newspaper,
  },
  {
    id: "calendar",
    label: "Calendar",
    icon: CalendarDays,
  },
  {
    id: "risk",
    label: "Risk",
    icon: Gauge,
  },
  {
    id: "telemetry",
    label: "Telemetry",
    icon: Activity,
  },
  {
    id: "learn",
    label: "Learn",
    icon: GraduationCap,
  },
];

function formatINR(value) {
  const number = Number(value || 0);

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(number);
}

function formatNumber(value) {
  return new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: 2,
  }).format(Number(value || 0));
}

function formatPercent(value) {
  const number = Number(value || 0);

  return `${number >= 0 ? "+" : ""}${number.toFixed(2)}%`;
}

function formatTime(timestamp) {
  return new Date(timestamp).toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

function generateOrderId() {
  return `MX-${Date.now().toString().slice(-8)}`;
}

function initialTradingState() {
  const savedCash = localStorage.getItem("marketx_cash");
  const savedHoldings = localStorage.getItem("marketx_holdings");
  const savedOrders = localStorage.getItem("marketx_orders");
  const savedRealized = localStorage.getItem("marketx_realized_pnl");

  return {
    cash: savedCash ? Number(savedCash) : 1000000,
    holdings: savedHoldings ? JSON.parse(savedHoldings) : {},
    orders: savedOrders ? JSON.parse(savedOrders) : [],
    realizedPnL: savedRealized ? Number(savedRealized) : 0,
  };
}

function tradingReducer(state, action) {
  switch (action.type) {
    case "RESET":
      return {
        cash: 1000000,
        holdings: {},
        orders: [],
        realizedPnL: 0,
      };

    case "EXECUTE_MARKET": {
      const {
        symbol,
        side,
        quantity,
        price,
      } = action.payload;

      const qty = Number(quantity);
      const executionPrice = Number(price);
      const value = qty * executionPrice;

      if (!qty || qty <= 0) {
        return state;
      }

      if (side === "BUY") {
        if (value > state.cash) {
          return {
            ...state,
            orders: [
              ...state.orders,
              {
                id: generateOrderId(),
                timestamp: Date.now(),
                symbol,
                side,
                orderType: "MARKET",
                quantity: qty,
                price: executionPrice,
                status: "REJECTED",
                reason: "Insufficient virtual cash",
              },
            ],
          };
        }

        const oldHolding = state.holdings[symbol];

        const oldQty = oldHolding?.quantity || 0;
        const oldAvg = oldHolding?.averagePrice || 0;

        const totalCost =
          oldQty * oldAvg + qty * executionPrice;

        const newQty = oldQty + qty;

        const newAveragePrice =
          totalCost / newQty;

        const newHoldings = {
          ...state.holdings,
          [symbol]: {
            symbol,
            quantity: newQty,
            averagePrice: newAveragePrice,
          },
        };

        return {
          ...state,
          cash: state.cash - value,
          holdings: newHoldings,
          orders: [
            ...state.orders,
            {
              id: generateOrderId(),
              timestamp: Date.now(),
              symbol,
              side,
              orderType: "MARKET",
              quantity: qty,
              price: executionPrice,
              status: "FILLED",
              reason: "",
            },
          ],
        };
      }

      const holding = state.holdings[symbol];

      if (!holding || holding.quantity < qty) {
        return {
          ...state,
          orders: [
            ...state.orders,
            {
              id: generateOrderId(),
              timestamp: Date.now(),
              symbol,
              side,
              orderType: "MARKET",
              quantity: qty,
              price: executionPrice,
              status: "REJECTED",
              reason: "Insufficient shares",
            },
          ],
        };
      }

      const realized =
        (executionPrice - holding.averagePrice) * qty;

      const remainingQty =
        holding.quantity - qty;

      const newHoldings = {
        ...state.holdings,
      };

      if (remainingQty <= 0) {
        delete newHoldings[symbol];
      } else {
        newHoldings[symbol] = {
          ...holding,
          quantity: remainingQty,
        };
      }

      return {
        ...state,
        cash: state.cash + value,
        holdings: newHoldings,
        realizedPnL: state.realizedPnL + realized,
        orders: [
          ...state.orders,
          {
            id: generateOrderId(),
            timestamp: Date.now(),
            symbol,
            side,
            orderType: "MARKET",
            quantity: qty,
            price: executionPrice,
            status: "FILLED",
            realizedPnL: realized,
            reason: "",
          },
        ],
      };
    }

    case "PLACE_ORDER": {
      return {
        ...state,
        orders: [
          ...state.orders,
          {
            id: generateOrderId(),
            timestamp: Date.now(),
            symbol: action.payload.symbol,
            side: action.payload.side,
            orderType: action.payload.orderType,
            quantity: Number(action.payload.quantity),
            price: Number(action.payload.price || 0),
            triggerPrice: Number(
              action.payload.triggerPrice || 0
            ),
            status: "OPEN",
            reason: "",
          },
        ],
      };
    }

    case "FILL_ORDER": {
      const order = state.orders.find(
        (item) =>
          item.id === action.payload.orderId &&
          item.status === "OPEN"
      );

      if (!order) {
        return state;
      }

      const executionPrice = Number(action.payload.price);
      const value = order.quantity * executionPrice;

      if (order.side === "BUY") {
        if (value > state.cash) {
          return {
            ...state,
            orders: state.orders.map((item) =>
              item.id === order.id
                ? {
                    ...item,
                    status: "REJECTED",
                    reason: "Insufficient virtual cash at execution",
                  }
                : item
            ),
          };
        }

        const holding = state.holdings[order.symbol];

        const oldQty = holding?.quantity || 0;
        const oldAvg = holding?.averagePrice || 0;

        const totalCost =
          oldQty * oldAvg +
          order.quantity * executionPrice;

        const newQty =
          oldQty + order.quantity;

        const newAverage =
          totalCost / newQty;

        return {
          ...state,
          cash: state.cash - value,
          holdings: {
            ...state.holdings,
            [order.symbol]: {
              symbol: order.symbol,
              quantity: newQty,
              averagePrice: newAverage,
            },
          },
          orders: state.orders.map((item) =>
            item.id === order.id
              ? {
                  ...item,
                  status: "FILLED",
                  price: executionPrice,
                }
              : item
          ),
        };
      }

      const holding = state.holdings[order.symbol];

      if (!holding || holding.quantity < order.quantity) {
        return {
          ...state,
          orders: state.orders.map((item) =>
            item.id === order.id
              ? {
                  ...item,
                  status: "REJECTED",
                  reason: "Insufficient shares at execution",
                }
              : item
          ),
        };
      }

      const realized =
        (executionPrice - holding.averagePrice) *
        order.quantity;

      const remainingQty =
        holding.quantity - order.quantity;

      const newHoldings = {
        ...state.holdings,
      };

      if (remainingQty <= 0) {
        delete newHoldings[order.symbol];
      } else {
        newHoldings[order.symbol] = {
          ...holding,
          quantity: remainingQty,
        };
      }

      return {
        ...state,
        cash: state.cash + value,
        holdings: newHoldings,
        realizedPnL:
          state.realizedPnL + realized,
        orders: state.orders.map((item) =>
          item.id === order.id
            ? {
                ...item,
                status: "FILLED",
                price: executionPrice,
                realizedPnL: realized,
              }
            : item
        ),
      };
    }

    case "CANCEL_ORDER":
      return {
        ...state,
        orders: state.orders.map((item) =>
          item.id === action.payload
            ? {
                ...item,
                status: "CANCELLED",
              }
            : item
        ),
      };

    default:
      return state;
  }
}

function App() {
  const [activePage, setActivePage] =
    useState("dashboard");

  const [mobileMenu, setMobileMenu] =
    useState(false);

  const [stocks, setStocks] =
    useState(FALLBACK_STOCKS);

  const [indices, setIndices] =
    useState(FALLBACK_INDICES);

  const [sectors, setSectors] =
    useState(FALLBACK_SECTORS);

  const [marketConnected, setMarketConnected] =
    useState(false);

  const [selectedSymbol, setSelectedSymbol] =
    useState("TCS");

  const [searchTerm, setSearchTerm] =
    useState("");

  const [watchlist, setWatchlist] =
    useState(() => {
      const saved =
        localStorage.getItem("marketx_watchlist");

      return saved
        ? JSON.parse(saved)
        : ["TCS", "RELIANCE"];
    });

  const [
    tradingState,
    dispatch,
  ] = useReducer(
    tradingReducer,
    undefined,
    initialTradingState
  );

  const selectedStock = useMemo(() => {
    return (
      stocks.find(
        (stock) =>
          stock.symbol === selectedSymbol
      ) || stocks[0]
    );
  }, [stocks, selectedSymbol]);

  useEffect(() => {
    if (!selectedStock && stocks.length) {
      setSelectedSymbol(stocks[0].symbol);
    }
  }, [selectedStock, stocks]);

  useEffect(() => {
    localStorage.setItem(
      "marketx_cash",
      tradingState.cash
    );

    localStorage.setItem(
      "marketx_holdings",
      JSON.stringify(tradingState.holdings)
    );

    localStorage.setItem(
      "marketx_orders",
      JSON.stringify(tradingState.orders)
    );

    localStorage.setItem(
      "marketx_realized_pnl",
      tradingState.realizedPnL
    );
  }, [tradingState]);

  useEffect(() => {
    localStorage.setItem(
      "marketx_watchlist",
      JSON.stringify(watchlist)
    );
  }, [watchlist]);

  async function fetchMarketData() {
    try {
      const [
        stocksResponse,
        indicesResponse,
        sectorsResponse,
      ] = await Promise.all([
        axios.get(`${API_BASE}/stocks`),
        axios.get(`${API_BASE}/indices`),
        axios.get(`${API_BASE}/sectors`),
      ]);

      setStocks(stocksResponse.data);
      setIndices(indicesResponse.data);
      setSectors(sectorsResponse.data);
      setMarketConnected(true);
    } catch (error) {
      setMarketConnected(false);
    }
  }

  useEffect(() => {
    fetchMarketData();

    const interval =
      setInterval(fetchMarketData, 15000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    tradingState.orders
      .filter(
        (order) => order.status === "OPEN"
      )
      .forEach((order) => {
        const stock = stocks.find(
          (item) =>
            item.symbol === order.symbol
        );

        if (!stock) return;

        const price = Number(stock.price);

        if (
          order.orderType === "LIMIT" &&
          order.side === "BUY" &&
          price <= order.price
        ) {
          dispatch({
            type: "FILL_ORDER",
            payload: {
              orderId: order.id,
              price,
            },
          });
        }

        if (
          order.orderType === "LIMIT" &&
          order.side === "SELL" &&
          price >= order.price
        ) {
          dispatch({
            type: "FILL_ORDER",
            payload: {
              orderId: order.id,
              price,
            },
          });
        }

        if (
          order.orderType === "STOP_LOSS" &&
          order.side === "SELL" &&
          price <= order.triggerPrice
        ) {
          dispatch({
            type: "FILL_ORDER",
            payload: {
              orderId: order.id,
              price,
            },
          });
        }
      });
  }, [stocks, tradingState.orders]);

  const portfolioPositions = useMemo(() => {
    return Object.values(
      tradingState.holdings
    ).map((holding) => {
      const stock = stocks.find(
        (item) =>
          item.symbol === holding.symbol
      );

      const currentPrice =
        stock?.price || holding.averagePrice;

      const marketValue =
        currentPrice * holding.quantity;

      const costBasis =
        holding.averagePrice *
        holding.quantity;

      const unrealizedPnL =
        marketValue - costBasis;

      const pnlPercent =
        costBasis > 0
          ? (unrealizedPnL / costBasis) * 100
          : 0;

      return {
        ...holding,
        company:
          stock?.company || holding.symbol,
        currentPrice,
        marketValue,
        costBasis,
        unrealizedPnL,
        pnlPercent,
      };
    });
  }, [tradingState.holdings, stocks]);

  const portfolioValue = useMemo(() => {
    return (
      tradingState.cash +
      portfolioPositions.reduce(
        (total, position) =>
          total + position.marketValue,
        0
      )
    );
  }, [tradingState.cash, portfolioPositions]);

  const totalUnrealizedPnL =
    portfolioPositions.reduce(
      (total, position) =>
        total + position.unrealizedPnL,
      0
    );

  const totalPnL =
    tradingState.realizedPnL +
    totalUnrealizedPnL;

  function createOrder(order) {
    const quantity = Number(order.quantity);

    if (!quantity || quantity <= 0) {
      return;
    }

    const stock = stocks.find(
      (item) =>
        item.symbol === order.symbol
    );

    if (!stock) return;

    const marketPrice =
      Number(stock.price);

    if (order.side === "BUY" &&
        order.orderType === "MARKET") {
      dispatch({
        type: "EXECUTE_MARKET",
        payload: {
          symbol: order.symbol,
          side: order.side,
          quantity,
          price: marketPrice,
        },
      });

      return;
    }

    if (order.side === "SELL" &&
        order.orderType === "MARKET") {
      dispatch({
        type: "EXECUTE_MARKET",
        payload: {
          symbol: order.symbol,
          side: order.side,
          quantity,
          price: marketPrice,
        },
      });

      return;
    }

    dispatch({
      type: "PLACE_ORDER",
      payload: {
        ...order,
        quantity,
        price:
          order.orderType === "LIMIT"
            ? Number(order.price)
            : marketPrice,
        triggerPrice:
          order.orderType === "STOP_LOSS"
            ? Number(order.triggerPrice)
            : null,
      },
    });
  }

  function cancelOrder(orderId) {
    dispatch({
      type: "CANCEL_ORDER",
      payload: orderId,
    });
  }

  function resetPaperAccount() {
    const confirmed =
      window.confirm(
        "Reset your MARKETX paper account to ₹10,00,000 and remove all holdings and orders?"
      );

    if (confirmed) {
      dispatch({
        type: "RESET",
      });
    }
  }

  function toggleWatchlist(symbol) {
    setWatchlist((current) => {
      if (current.includes(symbol)) {
        return current.filter(
          (item) => item !== symbol
        );
      }

      return [...current, symbol];
    });
  }

  function openTrade(symbol) {
    setSelectedSymbol(symbol);
    setActivePage("trade");
    setMobileMenu(false);
  }

  const filteredStocks = stocks.filter(
    (stock) =>
      stock.symbol
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      stock.company
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
  );

  function renderPage() {
    const commonProps = {
      stocks,
      indices,
      sectors,
      selectedStock,
      selectedSymbol,
      setSelectedSymbol,
      cash: tradingState.cash,
      holdings: tradingState.holdings,
      portfolioPositions,
      portfolioValue,
      totalPnL,
      totalUnrealizedPnL,
      realizedPnL: tradingState.realizedPnL,
      orders: tradingState.orders,
      watchlist,
      toggleWatchlist,
      openTrade,
      createOrder,
      cancelOrder,
      resetPaperAccount,
      marketConnected,
      setActivePage,
    };

    switch (activePage) {
      case "trade":
        return <TradeScreen {...commonProps} />;

      case "markets":
        return <MarketsScreen {...commonProps} />;

      case "portfolio":
        return <PortfolioScreen {...commonProps} />;

      case "orders":
        return <OrdersScreen {...commonProps} />;

      case "watchlist":
        return <WatchlistScreen {...commonProps} />;

      case "dom":
        return <DOMScreen {...commonProps} />;

      case "tape":
        return <TapeScreen {...commonProps} />;

      case "options":
        return <OptionsScreen {...commonProps} />;

      case "news":
        return <NewsScreen {...commonProps} />;

      case "calendar":
        return <CalendarScreen {...commonProps} />;

      case "risk":
        return <RiskScreen {...commonProps} />;

      case "telemetry":
        return <TelemetryScreen {...commonProps} />;

      case "learn":
        return <LearnScreen {...commonProps} />;

      default:
        return <DashboardScreen {...commonProps} />;
    }
  }

  return (
    <div className="app-shell">
      <aside
        className={`sidebar ${
          mobileMenu ? "mobile-open" : ""
        }`}
      >
        <div className="brand">
          <div className="brand-mark">
            <TrendingUp size={22} />
          </div>

          <div>
            <div className="brand-name">
              MARKET<span>X</span>
            </div>

            <div className="brand-subtitle">
              PAPER TRADING TERMINAL
            </div>
          </div>
        </div>

        <div className="sidebar-section-label">
          TERMINAL
        </div>

        <nav className="nav-list">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;

            return (
              <button
                key={item.id}
                type="button"
                className={`nav-item ${
                  activePage === item.id
                    ? "active"
                    : ""
                }`}
                onClick={() => {
                  setActivePage(item.id);
                  setMobileMenu(false);
                }}
              >
                <Icon size={18} />

                <span>{item.label}</span>

                {activePage === item.id && (
                  <ChevronRight
                    size={15}
                    className="nav-arrow"
                  />
                )}
              </button>
            );
          })}
        </nav>

        <div className="sidebar-bottom">
          <div className="paper-account-card">
            <div className="mini-label">
              PAPER ACCOUNT
            </div>

            <div className="paper-balance">
              {formatINR(portfolioValue)}
            </div>

            <div
              className={
                totalPnL >= 0
                  ? "positive"
                  : "negative"
              }
            >
              {totalPnL >= 0 ? "+" : ""}
              {formatINR(totalPnL)}
            </div>
          </div>

          <button
            type="button"
            className="nav-item"
            onClick={resetPaperAccount}
          >
            <RefreshCw size={18} />
            <span>Reset Account</span>
          </button>
        </div>
      </aside>

      {mobileMenu && (
        <div
          className="mobile-overlay"
          onClick={() => setMobileMenu(false)}
        />
      )}

      <main className="main-area">
        <header className="topbar">
          <button
            type="button"
            className="mobile-menu-button"
            onClick={() =>
              setMobileMenu(!mobileMenu)
            }
          >
            <Menu size={21} />
          </button>

          <div className="global-search">
            <Search size={18} />

            <input
              type="text"
              placeholder="Search stocks, companies..."
              value={searchTerm}
              onChange={(event) =>
                setSearchTerm(event.target.value)
              }
            />

            {searchTerm && (
              <div className="search-results">
                {filteredStocks
                  .slice(0, 5)
                  .map((stock) => (
                    <button
                      type="button"
                      key={stock.symbol}
                      onClick={() => {
                        setSelectedSymbol(
                          stock.symbol
                        );
                        setSearchTerm("");
                        setActivePage("trade");
                      }}
                    >
                      <strong>
                        {stock.symbol}
                      </strong>

                      <span>
                        {stock.company}
                      </span>
                    </button>
                  ))}
              </div>
            )}
          </div>

          <div className="topbar-actions">
            <div className="market-connection">
              <span
                className={`connection-dot ${
                  marketConnected
                    ? "connected"
                    : "disconnected"
                }`}
              />

              <span>
                {marketConnected
                  ? "API CONNECTED"
                  : "API OFFLINE"}
              </span>
            </div>

            <button
              type="button"
              className="icon-button"
              title="Notifications"
            >
              <Bell size={18} />
            </button>

            <button
              type="button"
              className="icon-button"
              title="Settings"
            >
              <Settings size={18} />
            </button>

            <div className="profile-circle">
              MX
            </div>
          </div>
        </header>

        <div className="page-content">
          {renderPage()}
        </div>
      </main>
    </div>
  );
}

function PageHeader({
  eyebrow,
  title,
  subtitle,
  icon: Icon,
  action,
}) {
  return (
    <div className="page-header">
      <div>
        <div className="eyebrow">
          {eyebrow}
        </div>

        <div className="page-title-row">
          {Icon && (
            <div className="title-icon">
              <Icon size={23} />
            </div>
          )}

          <div>
            <h1>{title}</h1>

            <p>{subtitle}</p>
          </div>
        </div>
      </div>

      {action}
    </div>
  );
}

function PanelHeader({
  title,
  subtitle,
  icon: Icon,
  action,
}) {
  return (
    <div className="panel-header">
      <div className="panel-title-area">
        {Icon && (
          <div className="panel-icon">
            <Icon size={17} />
          </div>
        )}

        <div>
          <h3>{title}</h3>

          {subtitle && (
            <span>{subtitle}</span>
          )}
        </div>
      </div>

      {action}
    </div>
  );
}

function StatCard({
  label,
  value,
  change,
  icon: Icon,
  accent = "purple",
}) {
  return (
    <div className={`stat-card ${accent}`}>
      <div className="stat-top">
        <span>{label}</span>

        {Icon && (
          <div className="stat-icon">
            <Icon size={18} />
          </div>
        )}
      </div>

      <strong>{value}</strong>

      {change !== undefined && (
        <div
          className={
            Number(change) >= 0
              ? "positive stat-change"
              : "negative stat-change"
          }
        >
          {Number(change) >= 0 ? (
            <ArrowUpRight size={15} />
          ) : (
            <ArrowDownRight size={15} />
          )}

          {formatPercent(change)}
        </div>
      )}
    </div>
  );
}

function DashboardScreen({
  stocks,
  indices,
  sectors,
  portfolioValue,
  totalPnL,
  totalUnrealizedPnL,
  realizedPnL,
  openTrade,
  watchlist,
  toggleWatchlist,
  marketConnected,
}) {
  return (
    <div className="screen">
      <PageHeader
        eyebrow="MARKETX TERMINAL"
        title="Trading Dashboard"
        subtitle="Your virtual trading command center."
        icon={LayoutDashboard}
        action={
          <div className="market-badge">
            <span className="live-pulse" />
            PAPER MARKET
          </div>
        }
      />

      <div className="stats-grid">
        <StatCard
          label="Portfolio Value"
          value={formatINR(portfolioValue)}
          icon={Wallet}
          accent="purple"
        />

        <StatCard
          label="Total P&L"
          value={formatINR(totalPnL)}
          change={
            portfolioValue
              ? (totalPnL / 1000000) * 100
              : 0
          }
          icon={TrendingUp}
          accent="green"
        />

        <StatCard
          label="Unrealised P&L"
          value={formatINR(totalUnrealizedPnL)}
          icon={Activity}
          accent="cyan"
        />

        <StatCard
          label="Realised P&L"
          value={formatINR(realizedPnL)}
          icon={CheckCircle2}
          accent="orange"
        />
      </div>

      <div className="dashboard-grid">
        <div className="panel indices-panel">
          <PanelHeader
            title="Market Indices"
            subtitle="Current reference prices"
            icon={BarChart3}
          />

          <div className="index-list">
            {indices.map((index) => (
              <div
                className="index-row"
                key={index.name}
              >
                <div>
                  <strong>
                    {index.name}
                  </strong>

                  <span>
                    {index.exchange}
                  </span>
                </div>

                <div className="index-value">
                  <strong>
                    {formatNumber(index.value)}
                  </strong>

                  <span
                    className={
                      index.change >= 0
                        ? "positive"
                        : "negative"
                    }
                  >
                    {formatNumber(index.change)}{" "}
                    ({formatPercent(
                      index.change_percent
                    )})
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="panel market-movers-panel">
          <PanelHeader
            title="Market Movers"
            subtitle="Top available instruments"
            icon={Zap}
          />

          <div className="movers-list">
            {stocks
              .slice()
              .sort(
                (a, b) =>
                  Math.abs(
                    b.change_percent
                  ) -
                  Math.abs(
                    a.change_percent
                  )
              )
              .map((stock) => (
                <button
                  type="button"
                  className="mover-row"
                  key={stock.symbol}
                  onClick={() =>
                    openTrade(stock.symbol)
                  }
                >
                  <div className="symbol-badge">
                    {stock.symbol.slice(0, 2)}
                  </div>

                  <div className="mover-name">
                    <strong>
                      {stock.symbol}
                    </strong>

                    <span>
                      {stock.company}
                    </span>
                  </div>

                  <div className="mover-price">
                    <strong>
                      {formatINR(stock.price)}
                    </strong>

                    <span
                      className={
                        stock.change >= 0
                          ? "positive"
                          : "negative"
                      }
                    >
                      {formatPercent(
                        stock.change_percent
                      )}
                    </span>
                  </div>
                </button>
              ))}
          </div>
        </div>

        <div className="panel watch-dashboard-panel">
          <PanelHeader
            title="Watchlist"
            subtitle={`${watchlist.length} instruments`}
            icon={Star}
          />

          <div className="mini-watchlist">
            {watchlist.map((symbol) => {
              const stock = stocks.find(
                (item) =>
                  item.symbol === symbol
              );

              if (!stock) return null;

              return (
                <div
                  className="mini-watch-row"
                  key={symbol}
                >
                  <button
                    type="button"
                    className="star-button active"
                    onClick={() =>
                      toggleWatchlist(symbol)
                    }
                  >
                    <Star size={15} />
                  </button>

                  <button
                    type="button"
                    className="watch-symbol-button"
                    onClick={() =>
                      openTrade(symbol)
                    }
                  >
                    <strong>{symbol}</strong>

                    <span>
                      {formatINR(stock.price)}
                    </span>
                  </button>

                  <span
                    className={
                      stock.change >= 0
                        ? "positive"
                        : "negative"
                    }
                  >
                    {formatPercent(
                      stock.change_percent
                    )}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="panel sector-panel">
          <PanelHeader
            title="Sector Pulse"
            subtitle="Current sector performance"
            icon={Activity}
          />

          <div className="sector-grid">
            {sectors.map((sector) => (
              <div
                className="sector-card"
                key={sector.short_name}
              >
                <span>
                  {sector.short_name}
                </span>

                <strong
                  className={
                    sector.performance >= 0
                      ? "positive"
                      : "negative"
                  }
                >
                  {formatPercent(
                    sector.performance
                  )}
                </strong>

                <div className="sector-bar">
                  <div
                    style={{
                      width: `${Math.min(
                        Math.abs(
                          sector.performance
                        ) * 35,
                        100
                      )}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="status-strip">
        <div>
          <span
            className={`connection-dot ${
              marketConnected
                ? "connected"
                : "disconnected"
            }`}
          />

          <strong>
            Market API
          </strong>

          <span>
            {marketConnected
              ? "Connected to MARKETX FastAPI backend"
              : "Backend unavailable. Showing fallback data."}
          </span>
        </div>

        <div>
          <ShieldCheck size={16} />
          Virtual money only
        </div>
      </div>
    </div>
  );
}

function TradeScreen({
  stocks,
  selectedStock,
  selectedSymbol,
  setSelectedSymbol,
  cash,
  holdings,
  createOrder,
}) {
  const [side, setSide] =
    useState("BUY");

  const [orderType, setOrderType] =
    useState("MARKET");

  const [quantity, setQuantity] =
    useState(1);

  const [limitPrice, setLimitPrice] =
    useState(
      selectedStock?.price || ""
    );

  const [stopPrice, setStopPrice] =
    useState("");

  useEffect(() => {
    if (selectedStock) {
      setLimitPrice(
        selectedStock.price
      );
    }
  }, [selectedStock]);

  useEffect(() => {
    if (
      side === "BUY" &&
      orderType === "STOP_LOSS"
    ) {
      setOrderType("MARKET");
      setStopPrice("");
    }
  }, [side, orderType]);

  const currentHolding =
    holdings[selectedSymbol];

  const executionPrice =
    orderType === "STOP_LOSS"
      ? Number(stopPrice || 0)
      : orderType === "LIMIT"
      ? Number(limitPrice || 0)
      : Number(
          selectedStock?.price || 0
        );

  const estimatedValue =
    Number(quantity || 0) *
    executionPrice;

  function handleSideChange(
    newSide
  ) {
    setSide(newSide);

    if (
      newSide === "BUY" &&
      orderType === "STOP_LOSS"
    ) {
      setOrderType("MARKET");
      setStopPrice("");
    }
  }

  function handleOrderTypeChange(
    newType
  ) {
    setOrderType(newType);

    if (newType === "MARKET") {
      setStopPrice("");
    }

    if (newType === "LIMIT") {
      setStopPrice("");
    }
  }

  function submitTrade() {
    const numericQuantity =
      Number(quantity);

    if (
      !numericQuantity ||
      numericQuantity <= 0
    ) {
      window.alert(
        "Please enter a valid quantity."
      );

      return;
    }

    if (
      orderType === "LIMIT" &&
      (!limitPrice ||
        Number(limitPrice) <= 0)
    ) {
      window.alert(
        "Please enter a valid limit price."
      );

      return;
    }

    if (
      orderType === "STOP_LOSS" &&
      (!stopPrice ||
        Number(stopPrice) <= 0)
    ) {
      window.alert(
        "Please enter a valid stop price."
      );

      return;
    }

    createOrder({
      symbol: selectedSymbol,
      side,
      quantity:
        numericQuantity,
      orderType,
      price:
        orderType === "LIMIT"
          ? Number(limitPrice)
          : selectedStock?.price,
      triggerPrice:
        orderType === "STOP_LOSS"
          ? Number(stopPrice)
          : null,
    });

    setQuantity(1);
  }

  return (
    <div
      className="screen"
      style={{
        position: "relative",
        zIndex: 10,
      }}
    >
      <PageHeader
        eyebrow="PAPER EXECUTION"
        title="Trade"
        subtitle="Place virtual orders against the current market price."
        icon={LineChart}
      />

      <div className="trade-layout">
        <div className="panel trade-chart-panel">
          <PanelHeader
            title={
              selectedStock
                ? selectedStock.symbol
                : "Instrument"
            }
            subtitle={
              selectedStock?.company ||
              "Select an instrument"
            }
            icon={BarChart3}
          />

          <div className="instrument-toolbar">
            <select
              value={selectedSymbol}
              onChange={(event) =>
                setSelectedSymbol(
                  event.target.value
                )
              }
              style={{
                position: "relative",
                zIndex: 50,
                pointerEvents: "auto",
              }}
            >
              {stocks.map((stock) => (
                <option
                  key={stock.symbol}
                  value={stock.symbol}
                >
                  {stock.symbol}
                </option>
              ))}
            </select>

            {selectedStock && (
              <div className="quote-box">
                <span>LTP</span>

                <strong>
                  {formatINR(
                    selectedStock.price
                  )}
                </strong>

                <span
                  className={
                    selectedStock.change >= 0
                      ? "positive"
                      : "negative"
                  }
                >
                  {formatPercent(
                    selectedStock.change_percent
                  )}
                </span>
              </div>
            )}
          </div>

          <div className="large-chart">
            <div className="chart-grid-lines">
              <span />
              <span />
              <span />
              <span />
              <span />
            </div>

            <svg
              viewBox="0 0 800 320"
              preserveAspectRatio="none"
              className="market-chart-svg"
            >
              <defs>
                <linearGradient
                  id="chartFill"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop
                    offset="0%"
                    stopOpacity="0.5"
                  />

                  <stop
                    offset="100%"
                    stopOpacity="0"
                  />
                </linearGradient>
              </defs>

              <path
                d="M0 245 L55 220 L100 230 L150 180 L205 200 L255 145 L310 170 L360 110 L420 135 L470 92 L520 125 L565 75 L615 100 L670 58 L720 85 L800 40"
                fill="none"
                stroke="currentColor"
                strokeWidth="4"
                className="chart-stroke"
              />

              <path
                d="M0 245 L55 220 L100 230 L150 180 L205 200 L255 145 L310 170 L360 110 L420 135 L470 92 L520 125 L565 75 L615 100 L670 58 L720 85 L800 40 L800 320 L0 320 Z"
                className="chart-fill"
              />
            </svg>

            <div className="chart-price-label">
              {formatINR(
                selectedStock?.price
              )}
            </div>
          </div>

          <div className="chart-footer">
            <button
              type="button"
              className="timeframe active"
            >
              1D
            </button>

            <button
              type="button"
              className="timeframe"
            >
              1W
            </button>

            <button
              type="button"
              className="timeframe"
            >
              1M
            </button>

            <button
              type="button"
              className="timeframe"
            >
              3M
            </button>

            <button
              type="button"
              className="timeframe"
            >
              1Y
            </button>

            <span className="chart-note">
              Paper market simulation
            </span>
          </div>
        </div>

        <div
          className="panel order-ticket"
          style={{
            position: "relative",
            zIndex: 100,
            pointerEvents: "auto",
          }}
        >
          <PanelHeader
            title="Order Ticket"
            subtitle="Virtual execution"
            icon={CircleDollarSign}
          />

          <div
            className="side-switch"
            style={{
              position: "relative",
              zIndex: 200,
              pointerEvents: "auto",
            }}
          >
            <button
              type="button"
              className={
                side === "BUY"
                  ? "buy active"
                  : "buy"
              }
              onClick={() =>
                handleSideChange("BUY")
              }
              style={{
                position: "relative",
                zIndex: 300,
                pointerEvents: "auto",
                cursor: "pointer",
              }}
            >
              BUY
            </button>

            <button
              type="button"
              className={
                side === "SELL"
                  ? "sell active"
                  : "sell"
              }
              onClick={() =>
                handleSideChange("SELL")
              }
              style={{
                position: "relative",
                zIndex: 300,
                pointerEvents: "auto",
                cursor: "pointer",
              }}
            >
              SELL
            </button>
          </div>

          <div className="form-group">
            <label>
              Instrument
            </label>

            <select
              value={selectedSymbol}
              onChange={(event) =>
                setSelectedSymbol(
                  event.target.value
                )
              }
              style={{
                position: "relative",
                zIndex: 200,
                pointerEvents: "auto",
                cursor: "pointer",
              }}
            >
              {stocks.map((stock) => (
                <option
                  key={stock.symbol}
                  value={stock.symbol}
                >
                  {stock.symbol} ·{" "}
                  {stock.company}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>
              Order Type
            </label>

            <select
              value={orderType}
              onChange={(event) =>
                handleOrderTypeChange(
                  event.target.value
                )
              }
              style={{
                position: "relative",
                zIndex: 200,
                pointerEvents: "auto",
                cursor: "pointer",
              }}
            >
              <option value="MARKET">
                Market
              </option>

              <option value="LIMIT">
                Limit
              </option>

              {side === "SELL" && (
                <option value="STOP_LOSS">
                  Stop-Loss
                </option>
              )}
            </select>
          </div>

          <div className="form-group">
            <label>
              Quantity
            </label>

            <input
              type="number"
              min="1"
              step="1"
              value={quantity}
              onChange={(event) =>
                setQuantity(
                  event.target.value
                )
              }
              style={{
                position: "relative",
                zIndex: 200,
                pointerEvents: "auto",
              }}
            />
          </div>

          {orderType === "LIMIT" && (
            <div className="form-group">
              <label>
                Limit Price
              </label>

              <input
                type="number"
                min="0"
                step="0.05"
                value={limitPrice}
                onChange={(event) =>
                  setLimitPrice(
                    event.target.value
                  )
                }
                style={{
                  position: "relative",
                  zIndex: 200,
                  pointerEvents: "auto",
                }}
              />
            </div>
          )}

          {orderType ===
            "STOP_LOSS" && (
            <div className="form-group">
              <label>
                Stop Price
              </label>

              <input
                type="number"
                min="0"
                step="0.05"
                placeholder="Example: 4100"
                value={stopPrice}
                onChange={(event) =>
                  setStopPrice(
                    event.target.value
                  )
                }
                style={{
                  position: "relative",
                  zIndex: 200,
                  pointerEvents: "auto",
                }}
              />
            </div>
          )}

          <div className="order-summary">
            <div>
              <span>
                Current Price
              </span>

              <strong>
                {formatINR(
                  selectedStock?.price
                )}
              </strong>
            </div>

            <div>
              <span>
                Estimated Value
              </span>

              <strong>
                {formatINR(
                  estimatedValue
                )}
              </strong>
            </div>

            <div>
              <span>
                Available Cash
              </span>

              <strong>
                {formatINR(cash)}
              </strong>
            </div>

            <div>
              <span>
                Holding
              </span>

              <strong>
                {currentHolding
                  ? `${currentHolding.quantity} shares`
                  : "0 shares"}
              </strong>
            </div>
          </div>

          <button
            type="button"
            className={`execute-button ${
              side === "BUY"
                ? "buy"
                : "sell"
            }`}
            onClick={submitTrade}
            style={{
              position: "relative",
              zIndex: 300,
              pointerEvents: "auto",
              cursor: "pointer",
            }}
          >
            {side === "BUY"
              ? "PLACE BUY ORDER"
              : "PLACE SELL ORDER"}
          </button>

          <div className="paper-warning">
            <ShieldCheck size={16} />

            <span>
              This terminal uses virtual
              money only. No real trade is
              sent to an exchange.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function MarketsScreen({
  stocks,
  openTrade,
  watchlist,
  toggleWatchlist,
}) {
  return (
    <div className="screen">
      <PageHeader
        eyebrow="MARKET MONITOR"
        title="Markets"
        subtitle="Explore available instruments and their current prices."
        icon={BarChart3}
      />

      <div className="panel">
        <PanelHeader
          title="Equity Universe"
          subtitle={`${stocks.length} instruments`}
          icon={ListFilter}
        />

        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Watch</th>
                <th>Symbol</th>
                <th>Company</th>
                <th>Sector</th>
                <th>Price</th>
                <th>Change</th>
                <th>Market Cap</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {stocks.map((stock) => (
                <tr key={stock.symbol}>
                  <td>
                    <button
                      type="button"
                      className={`star-button ${
                        watchlist.includes(
                          stock.symbol
                        )
                          ? "active"
                          : ""
                      }`}
                      onClick={() =>
                        toggleWatchlist(
                          stock.symbol
                        )
                      }
                    >
                      <Star size={15} />
                    </button>
                  </td>

                  <td>
                    <strong>
                      {stock.symbol}
                    </strong>
                  </td>

                  <td>
                    {stock.company}
                  </td>

                  <td>
                    <span className="tag">
                      {stock.sector}
                    </span>
                  </td>

                  <td>
                    {formatINR(
                      stock.price
                    )}
                  </td>

                  <td>
                    <span
                      className={
                        stock.change >= 0
                          ? "positive"
                          : "negative"
                      }
                    >
                      {formatNumber(
                        stock.change
                      )}{" "}
                      (
                      {formatPercent(
                        stock.change_percent
                      )}
                      )
                    </span>
                  </td>

                  <td>
                    {stock.market_cap}
                  </td>

                  <td>
                    <button
                      type="button"
                      className="small-action"
                      onClick={() =>
                        openTrade(
                          stock.symbol
                        )
                      }
                    >
                      Trade
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function PortfolioScreen({
  portfolioPositions,
  portfolioValue,
  totalPnL,
  totalUnrealizedPnL,
  realizedPnL,
  resetPaperAccount,
  openTrade,
}) {
  return (
    <div className="screen">
      <PageHeader
        eyebrow="ACCOUNT"
        title="Portfolio"
        subtitle="Track holdings, cost basis and mark-to-market performance."
        icon={BriefcaseBusiness}
        action={
          <button
            type="button"
            className="secondary-button"
            onClick={resetPaperAccount}
          >
            <RefreshCw size={16} />
            Reset Account
          </button>
        }
      />

      <div className="stats-grid">
        <StatCard
          label="Portfolio Value"
          value={formatINR(
            portfolioValue
          )}
          icon={Wallet}
          accent="purple"
        />

        <StatCard
          label="Total P&L"
          value={formatINR(totalPnL)}
          icon={TrendingUp}
          accent="green"
        />

        <StatCard
          label="Realised"
          value={formatINR(realizedPnL)}
          icon={CheckCircle2}
          accent="orange"
        />

        <StatCard
          label="Unrealised"
          value={formatINR(
            totalUnrealizedPnL
          )}
          icon={Activity}
          accent="cyan"
        />
      </div>

      <div className="panel">
        <PanelHeader
          title="Open Positions"
          subtitle={`${portfolioPositions.length} holdings`}
          icon={BriefcaseBusiness}
        />

        {portfolioPositions.length === 0 ? (
          <EmptyState
            icon={BriefcaseBusiness}
            title="No positions yet"
            text="Use the Trade screen to buy your first virtual position."
          />
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Symbol</th>
                  <th>Quantity</th>
                  <th>Average Price</th>
                  <th>Current Price</th>
                  <th>Cost Basis</th>
                  <th>Market Value</th>
                  <th>P&L</th>
                  <th></th>
                </tr>
              </thead>

              <tbody>
                {portfolioPositions.map(
                  (position) => (
                    <tr
                      key={position.symbol}
                    >
                      <td>
                        <strong>
                          {position.symbol}
                        </strong>

                        <span className="table-subtext">
                          {position.company}
                        </span>
                      </td>

                      <td>
                        {formatNumber(
                          position.quantity
                        )}
                      </td>

                      <td>
                        {formatINR(
                          position.averagePrice
                        )}
                      </td>

                      <td>
                        {formatINR(
                          position.currentPrice
                        )}
                      </td>

                      <td>
                        {formatINR(
                          position.costBasis
                        )}
                      </td>

                      <td>
                        {formatINR(
                          position.marketValue
                        )}
                      </td>

                      <td>
                        <strong
                          className={
                            position.unrealizedPnL >=
                            0
                              ? "positive"
                              : "negative"
                          }
                        >
                          {formatINR(
                            position.unrealizedPnL
                          )}
                        </strong>

                        <span
                          className={
                            position.pnlPercent >=
                            0
                              ? "positive table-subtext"
                              : "negative table-subtext"
                          }
                        >
                          {formatPercent(
                            position.pnlPercent
                          )}
                        </span>
                      </td>

                      <td>
                        <button
                          type="button"
                          className="small-action"
                          onClick={() =>
                            openTrade(
                              position.symbol
                            )
                          }
                        >
                          Trade
                        </button>
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function OrdersScreen({
  orders,
  cancelOrder,
}) {
  const openCount =
    orders.filter(
      (order) => order.status === "OPEN"
    ).length;

  const filledCount =
    orders.filter(
      (order) => order.status === "FILLED"
    ).length;

  const cancelledCount =
    orders.filter(
      (order) =>
        order.status === "CANCELLED"
    ).length;

  const rejectedCount =
    orders.filter(
      (order) =>
        order.status === "REJECTED"
    ).length;

  return (
    <div className="screen">
      <PageHeader
        eyebrow="ORDER MANAGEMENT"
        title="Orders"
        subtitle="Monitor every virtual order and its execution state."
        icon={ListFilter}
      />

      <div className="order-counters">
        <div>
          <span>Open</span>
          <strong>{openCount}</strong>
        </div>

        <div>
          <span>Filled</span>
          <strong>{filledCount}</strong>
        </div>

        <div>
          <span>Cancelled</span>
          <strong>{cancelledCount}</strong>
        </div>

        <div>
          <span>Rejected</span>
          <strong>{rejectedCount}</strong>
        </div>
      </div>

      <div className="panel">
        <PanelHeader
          title="Order Blotter"
          subtitle="Most recent orders"
          icon={ListFilter}
        />

        {orders.length === 0 ? (
          <EmptyState
            icon={ListFilter}
            title="No orders yet"
            text="Orders you place from the Trade screen will appear here."
          />
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Time</th>
                  <th>Symbol</th>
                  <th>Side</th>
                  <th>Type</th>
                  <th>Qty</th>
                  <th>Price</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {orders
                  .slice()
                  .reverse()
                  .map((order) => (
                    <tr key={order.id}>
                      <td>
                        <code>
                          {order.id}
                        </code>
                      </td>

                      <td>
                        {formatTime(
                          order.timestamp
                        )}
                      </td>

                      <td>
                        <strong>
                          {order.symbol}
                        </strong>
                      </td>

                      <td>
                        <span
                          className={
                            order.side ===
                            "BUY"
                              ? "side-badge buy"
                              : "side-badge sell"
                          }
                        >
                          {order.side}
                        </span>
                      </td>

                      <td>
                        {order.orderType}
                      </td>

                      <td>
                        {formatNumber(
                          order.quantity
                        )}
                      </td>

                      <td>
                        {formatINR(
                          order.price
                        )}
                      </td>

                      <td>
                        <StatusBadge
                          status={
                            order.status
                          }
                        />

                        {order.reason && (
                          <span className="table-subtext">
                            {order.reason}
                          </span>
                        )}
                      </td>

                      <td>
                        {order.status ===
                          "OPEN" && (
                          <button
                            type="button"
                            className="cancel-button"
                            onClick={() =>
                              cancelOrder(
                                order.id
                              )
                            }
                          >
                            Cancel
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function WatchlistScreen({
  stocks,
  watchlist,
  toggleWatchlist,
  openTrade,
}) {
  const watchStocks =
    stocks.filter((stock) =>
      watchlist.includes(
        stock.symbol
      )
    );

  return (
    <div className="screen">
      <PageHeader
        eyebrow="PERSONAL MONITOR"
        title="Watchlist"
        subtitle="Keep your most important instruments one click away."
        icon={Star}
      />

      <div className="watch-grid">
        {watchStocks.length === 0 ? (
          <div className="panel">
            <EmptyState
              icon={Star}
              title="Your watchlist is empty"
              text="Add instruments from the Markets screen."
            />
          </div>
        ) : (
          watchStocks.map((stock) => (
            <div
              className="watch-card"
              key={stock.symbol}
            >
              <div className="watch-card-top">
                <div className="symbol-badge large">
                  {stock.symbol.slice(0, 2)}
                </div>

                <button
                  type="button"
                  className="star-button active"
                  onClick={() =>
                    toggleWatchlist(
                      stock.symbol
                    )
                  }
                >
                  <Star size={16} />
                </button>
              </div>

              <strong className="watch-card-symbol">
                {stock.symbol}
              </strong>

              <span className="watch-card-company">
                {stock.company}
              </span>

              <div className="watch-card-price">
                {formatINR(
                  stock.price
                )}
              </div>

              <div
                className={
                  stock.change >= 0
                    ? "positive"
                    : "negative"
                }
              >
                {formatNumber(
                  stock.change
                )}{" "}
                ·{" "}
                {formatPercent(
                  stock.change_percent
                )}
              </div>

              <button
                type="button"
                className="primary-button full"
                onClick={() =>
                  openTrade(
                    stock.symbol
                  )
                }
              >
                Open Trade
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function DOMScreen({
  selectedStock,
}) {
  const base =
    Number(
      selectedStock?.price || 0
    );

  const levels = Array.from(
    { length: 11 },
    (_, index) => {
      const offset =
        index - 5;

      const price =
        base + offset * 5;

      return {
        price,
        bid:
          Math.max(
            20,
            180 -
              Math.abs(offset) * 20
          ),
        ask:
          Math.max(
            25,
            165 -
              Math.abs(offset) * 17
          ),
      };
    }
  ).reverse();

  return (
    <div className="screen">
      <PageHeader
        eyebrow="ORDER BOOK"
        title="Market Depth"
        subtitle="Price ladder view for the selected instrument."
        icon={Activity}
      />

      <div className="panel dom-panel">
        <PanelHeader
          title={
            selectedStock?.symbol ||
            "Instrument"
          }
          subtitle="Level 2 learning view"
          icon={Activity}
        />

        <div className="dom-head">
          <span>Bid Size</span>
          <span>Price</span>
          <span>Ask Size</span>
        </div>

        <div className="dom-ladder">
          {levels.map(
            (level, index) => (
              <div
                className={`dom-row ${
                  index === 5
                    ? "mid-price"
                    : ""
                }`}
                key={`${level.price}-${index}`}
              >
                <span className="bid-volume">
                  {level.bid}
                </span>

                <strong>
                  {formatNumber(
                    level.price
                  )}
                </strong>

                <span className="ask-volume">
                  {level.ask}
                </span>
              </div>
            )
          )}
        </div>

        <div className="educational-note">
          <BookOpen size={16} />
          This screen is currently an
          educational order-book
          visualization. It is not being
          represented as an authentic
          exchange Level 2 feed.
        </div>
      </div>
    </div>
  );
}

function TapeScreen({
  selectedStock,
}) {
  const base =
    Number(
      selectedStock?.price || 0
    );

  const prints = Array.from(
    { length: 12 },
    (_, index) => {
      const price =
        base +
        ((index % 5) - 2) *
          2.5;

      const quantity =
        10 + index * 5;

      const side =
        index % 3 === 0
          ? "SELL"
          : "BUY";

      return {
        id: index,
        time: `14:${String(
          22 + index
        ).padStart(2, "0")}:${
          10 + index
        }`,
        price,
        quantity,
        side,
      };
    }
  );

  return (
    <div className="screen">
      <PageHeader
        eyebrow="EXECUTION FLOW"
        title="Time & Sales"
        subtitle="Trade-print learning interface for the selected instrument."
        icon={Zap}
      />

      <div className="panel">
        <PanelHeader
          title={
            selectedStock?.symbol ||
            "Instrument"
          }
          subtitle="Recent trade prints"
          icon={Clock3}
        />

        <div className="tape-head">
          <span>Time</span>
          <span>Side</span>
          <span>Price</span>
          <span>Quantity</span>
        </div>

        <div className="tape-list">
          {prints.map((print) => (
            <div
              className="tape-row"
              key={print.id}
            >
              <span>
                {print.time}
              </span>

              <strong
                className={
                  print.side ===
                  "BUY"
                    ? "positive"
                    : "negative"
                }
              >
                {print.side}
              </strong>

              <span>
                {formatINR(
                  print.price
                )}
              </span>

              <span>
                {print.quantity}
              </span>
            </div>
          ))}
        </div>

        <div className="educational-note">
          <BookOpen size={16} />
          This is an educational tape
          interface. It is not an
          authenticated exchange Time &
          Sales feed.
        </div>
      </div>
    </div>
  );
}

function OptionsScreen() {
  const strikes = [
    23800,
    24000,
    24200,
    24400,
    24600,
    24800,
    25000,
  ];

  return (
    <div className="screen">
      <PageHeader
        eyebrow="DERIVATIVES"
        title="Options Matrix"
        subtitle="Explore an options-chain style learning interface."
        icon={Target}
      />

      <div className="panel">
        <PanelHeader
          title="NIFTY Options"
          subtitle="Illustrative matrix"
          icon={Target}
        />

        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Call OI</th>
                <th>Call LTP</th>
                <th>Strike</th>
                <th>Put LTP</th>
                <th>Put OI</th>
                <th>Delta</th>
                <th>Gamma</th>
              </tr>
            </thead>

            <tbody>
              {strikes.map(
                (strike, index) => (
                  <tr
                    key={strike}
                    className={
                      index === 3
                        ? "highlight-row"
                        : ""
                    }
                  >
                    <td>
                      {(
                        12000 +
                        index * 1450
                      ).toLocaleString()}
                    </td>

                    <td>
                      {formatINR(
                        620 -
                          index * 38
                      )}
                    </td>

                    <td>
                      <strong>
                        {strike}
                      </strong>
                    </td>

                    <td>
                      {formatINR(
                        410 +
                          index * 34
                      )}
                    </td>

                    <td>
                      {(
                        14000 +
                        index * 1100
                      ).toLocaleString()}
                    </td>

                    <td>
                      {(
                        0.62 -
                        index * 0.07
                      ).toFixed(2)}
                    </td>

                    <td>
                      {(
                        0.0018 +
                        index * 0.0002
                      ).toFixed(4)}
                    </td>
                  </tr>
                )
              )}
            </tbody>
          </table>
        </div>

        <div className="educational-note">
          <BookOpen size={16} />
          Options-chain values on this
          screen are educational data and
          are not presented as a live
          derivatives feed.
        </div>
      </div>
    </div>
  );
}

function NewsScreen({
  selectedStock,
}) {
  const symbol =
    selectedStock?.symbol ||
    "MARKET";

  const news = [
    {
      title: `${symbol} market activity remains in focus`,
      category: "MARKET",
      severity: "NORMAL",
      time: "14:22",
    },
    {
      title:
        "Indian equities continue monitoring global market signals",
      category: "MACRO",
      severity: "NORMAL",
      time: "14:17",
    },
    {
      title:
        "Investors watch sector rotation and institutional flows",
      category: "MARKET",
      severity: "WATCH",
      time: "14:08",
    },
    {
      title:
        "Technology and banking stocks remain actively traded",
      category: "SECTOR",
      severity: "NORMAL",
      time: "13:54",
    },
  ];

  return (
    <div className="screen">
      <PageHeader
        eyebrow="INFORMATION WIRE"
        title="Market News"
        subtitle={`News workspace filtered around ${symbol}.`}
        icon={Newspaper}
      />

      <div className="news-grid">
        {news.map((item) => (
          <div
            className="news-card"
            key={item.title}
          >
            <div className="news-card-top">
              <span className="tag">
                {item.category}
              </span>

              <span>
                {item.time}
              </span>
            </div>

            <h3>
              {item.title}
            </h3>

            <div className="news-card-bottom">
              <span>
                {item.severity}
              </span>

              <button
                type="button"
                className="text-button"
              >
                Read
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="educational-note">
        <BookOpen size={16} />
        This news workspace currently
        contains interface examples. It
        is not being represented as a
        connected real-time financial-news
        provider.
      </div>
    </div>
  );
}

function CalendarScreen() {
  const events = [
    {
      time: "09:30",
      event: "Indian Market Open",
      impact: "HIGH",
    },
    {
      time: "11:00",
      event: "Manufacturing Activity",
      impact: "MEDIUM",
    },
    {
      time: "14:30",
      event: "Global Market Update",
      impact: "MEDIUM",
    },
    {
      time: "18:00",
      event: "Central Bank Commentary",
      impact: "HIGH",
    },
  ];

  return (
    <div className="screen">
      <PageHeader
        eyebrow="MACRO EVENTS"
        title="Economic Calendar"
        subtitle="Track market-sensitive events in a trading workflow."
        icon={CalendarDays}
      />

      <div className="calendar-grid">
        {events.map((event) => (
          <div
            className="calendar-card"
            key={event.event}
          >
            <div className="calendar-time">
              <Clock3 size={16} />
              {event.time}
            </div>

            <h3>
              {event.event}
            </h3>

            <span
              className={`impact ${event.impact.toLowerCase()}`}
            >
              {event.impact} IMPACT
            </span>
          </div>
        ))}
      </div>

      <div className="educational-note">
        <BookOpen size={16} />
        Calendar entries are currently
        interface examples and are not
        presented as a live economic-data
        feed.
      </div>
    </div>
  );
}

function RiskScreen({
  portfolioPositions,
  portfolioValue,
  totalPnL,
}) {
  const invested =
    portfolioPositions.reduce(
      (sum, position) =>
        sum + position.costBasis,
      0
    );

  const exposure =
    portfolioValue > 0
      ? (invested / portfolioValue) *
        100
      : 0;

  const maxDrawdown =
    totalPnL < 0
      ? Math.abs(totalPnL)
      : 0;

  return (
    <div className="screen">
      <PageHeader
        eyebrow="RISK ENGINE"
        title="Risk Analytics"
        subtitle="Understand portfolio exposure and simulated risk metrics."
        icon={Gauge}
      />

      <div className="stats-grid">
        <StatCard
          label="Capital Exposure"
          value={`${exposure.toFixed(
            2
          )}%`}
          icon={Gauge}
          accent="purple"
        />

        <StatCard
          label="Invested Capital"
          value={formatINR(
            invested
          )}
          icon={Wallet}
          accent="cyan"
        />

        <StatCard
          label="Simulated Drawdown"
          value={formatINR(
            maxDrawdown
          )}
          icon={TrendingDown}
          accent="orange"
        />

        <StatCard
          label="Positions"
          value={String(
            portfolioPositions.length
          )}
          icon={BriefcaseBusiness}
          accent="green"
        />
      </div>

      <div className="risk-grid">
        <div className="panel">
          <PanelHeader
            title="Exposure"
            subtitle="Current portfolio allocation"
            icon={Gauge}
          />

          {portfolioPositions.length ===
          0 ? (
            <EmptyState
              icon={Gauge}
              title="No exposure"
              text="Your risk exposure will appear after you open a position."
            />
          ) : (
            <div className="exposure-list">
              {portfolioPositions.map(
                (position) => {
                  const percentage =
                    invested > 0
                      ? (position.costBasis /
                          invested) *
                        100
                      : 0;

                  return (
                    <div
                      className="exposure-row"
                      key={
                        position.symbol
                      }
                    >
                      <div>
                        <strong>
                          {position.symbol}
                        </strong>

                        <span>
                          {formatPercent(
                            percentage
                          )}
                        </span>
                      </div>

                      <div className="exposure-bar">
                        <div
                          style={{
                            width: `${Math.min(
                              percentage,
                              100
                            )}%`,
                          }}
                        />
                      </div>
                    </div>
                  );
                }
              )}
            </div>
          )}
        </div>

        <div className="panel">
          <PanelHeader
            title="Risk Controls"
            subtitle="Paper-account guardrails"
            icon={ShieldCheck}
          />

          <div className="risk-controls">
            <RiskControl
              label="Fat-finger protection"
              value="Conceptual"
            />

            <RiskControl
              label="Notional limit"
              value="Conceptual"
            />

            <RiskControl
              label="Buying power"
              value="Active"
            />

            <RiskControl
              label="Margin monitoring"
              value="Active"
            />
          </div>
        </div>
      </div>

      <div className="educational-note">
        <BookOpen size={16} />
        Risk calculations here are
        portfolio-learning metrics. They
        should not be interpreted as
        regulatory risk controls.
      </div>
    </div>
  );
}

function RiskControl({
  label,
  value,
}) {
  return (
    <div className="risk-control-row">
      <div>
        <ShieldCheck size={17} />
        <span>{label}</span>
      </div>

      <strong>{value}</strong>
    </div>
  );
}

function TelemetryScreen({
  marketConnected,
}) {
  return (
    <div className="screen">
      <PageHeader
        eyebrow="SYSTEM HEALTH"
        title="Telemetry"
        subtitle="Monitor the local MARKETX application state."
        icon={Activity}
      />

      <div className="telemetry-grid">
        <TelemetryCard
          label="Backend API"
          value={
            marketConnected
              ? "CONNECTED"
              : "OFFLINE"
          }
          status={marketConnected}
        />

        <TelemetryCard
          label="Frontend"
          value="RUNNING"
          status
        />

        <TelemetryCard
          label="Paper Engine"
          value="ACTIVE"
          status
        />

        <TelemetryCard
          label="Local Storage"
          value="ACTIVE"
          status
        />
      </div>

      <div className="panel">
        <PanelHeader
          title="Architecture"
          subtitle="Current application pipeline"
          icon={Activity}
        />

        <div className="architecture">
          <ArchitectureStep
            number="01"
            title="FastAPI"
            text="Provides market data endpoints."
          />

          <div className="architecture-arrow">
            →
          </div>

          <ArchitectureStep
            number="02"
            title="React"
            text="Consumes and displays market data."
          />

          <div className="architecture-arrow">
            →
          </div>

          <ArchitectureStep
            number="03"
            title="Paper Engine"
            text="Processes virtual trades and portfolio state."
          />

          <div className="architecture-arrow">
            →
          </div>

          <ArchitectureStep
            number="04"
            title="Local Storage"
            text="Persists the paper account locally."
          />
        </div>
      </div>
    </div>
  );
}

function TelemetryCard({
  label,
  value,
  status,
}) {
  return (
    <div className="telemetry-card">
      <div className="telemetry-icon">
        <Activity size={18} />
      </div>

      <span>{label}</span>

      <strong>{value}</strong>

      <div
        className={`telemetry-status ${
          status
            ? "healthy"
            : "warning"
        }`}
      >
        <span />
        {status
          ? "Healthy"
          : "Check connection"}
      </div>
    </div>
  );
}

function ArchitectureStep({
  number,
  title,
  text,
}) {
  return (
    <div className="architecture-step">
      <div className="architecture-number">
        {number}
      </div>

      <strong>{title}</strong>

      <span>{text}</span>
    </div>
  );
}

function LearnScreen() {
  const lessons = [
    {
      icon: Wallet,
      title: "Virtual Cash",
      text: "Your account starts with ₹10,00,000 of virtual cash.",
    },
    {
      icon: TrendingUp,
      title: "Buying Shares",
      text: "Buying shares reduces cash and creates a position using an average purchase price.",
    },
    {
      icon: TrendingDown,
      title: "Selling Shares",
      text: "Selling shares returns virtual cash and calculates realised profit or loss.",
    },
    {
      icon: Activity,
      title: "Unrealised P&L",
      text: "Unrealised P&L changes as the current market price changes.",
    },
    {
      icon: ListFilter,
      title: "Limit Orders",
      text: "Limit orders remain open until the market price reaches the specified level.",
    },
    {
      icon: ShieldCheck,
      title: "Paper Trading",
      text: "MARKETX is designed for learning. No real-money exchange order is submitted.",
    },
  ];

  return (
    <div className="screen">
      <PageHeader
        eyebrow="LEARNING CENTER"
        title="Learn Trading"
        subtitle="Understand what MARKETX is doing behind the interface."
        icon={GraduationCap}
      />

      <div className="learning-grid">
        {lessons.map((lesson) => {
          const Icon = lesson.icon;

          return (
            <div
              className="learning-card"
              key={lesson.title}
            >
              <div className="learning-icon">
                <Icon size={21} />
              </div>

              <h3>
                {lesson.title}
              </h3>

              <p>
                {lesson.text}
              </p>
            </div>
          );
        })}
      </div>

      <div className="panel learning-account">
        <PanelHeader
          title="Trading Logic"
          subtitle="The basic MARKETX calculation flow"
          icon={BookOpen}
        />

        <div className="logic-flow">
          <div>
            <span>BUY</span>
            <strong>
              Cash ↓
            </strong>
          </div>

          <ChevronRight />

          <div>
            <span>POSITION</span>
            <strong>
              Quantity ↑
            </strong>
          </div>

          <ChevronRight />

          <div>
            <span>PRICE MOVES</span>
            <strong>
              P&L changes
            </strong>
          </div>

          <ChevronRight />

          <div>
            <span>SELL</span>
            <strong>
              Cash ↑
            </strong>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatusBadge({
  status,
}) {
  const className =
    status === "FILLED"
      ? "status-filled"
      : status === "OPEN"
      ? "status-open"
      : status === "CANCELLED"
      ? "status-cancelled"
      : "status-rejected";

  return (
    <span
      className={`status-badge ${className}`}
    >
      {status}
    </span>
  );
}

function EmptyState({
  icon: Icon,
  title,
  text,
}) {
  return (
    <div className="empty-state">
      <div className="empty-icon">
        {Icon && <Icon size={24} />}
      </div>

      <h3>{title}</h3>

      <p>{text}</p>
    </div>
  );
}

export default App;