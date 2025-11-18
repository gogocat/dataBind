const { useState, useEffect, useRef } = React;

// Query component
function Query({ query }) {
    return (
        <td className={query.elapsedClassName}>
            <span>{query.formatElapsed}</span>
            <div className="popover left">
                <div className="popover-content">{query.query}</div>
                <div className="arrow"></div>
            </div>
        </td>
    );
}

// Database row component
function Database({ database }) {
    return (
        <tr>
            <td className="dbname">{database.dbname}</td>
            <td className="query-count">
                <span className={database.lastSample.countClassName}>
                    {database.lastSample.nbQueries}
                </span>
            </td>
            {database.lastSample.topFiveQueries.map((query, index) => (
                <Query key={index} query={query} />
            ))}
        </tr>
    );
}

// Main app component
function App() {
    const [databases, setDatabases] = useState([]);
    const performanceEnv = useRef(window.ENV);
    const performanceMonitoring = useRef(window.Monitoring);
    const timeoutId = useRef(null);

    const refreshApp = () => {
        const newData = performanceEnv.current.generateData().toArray();
        setDatabases(newData);

        performanceMonitoring.current.renderRate.ping();
        timeoutId.current = setTimeout(refreshApp, performanceEnv.current.timeout);
    };

    useEffect(() => {
        // Initial render
        const initialData = performanceEnv.current.generateData().toArray();
        setDatabases(initialData);

        console.log('dbMonApp (React) initialized');

        // Start the refresh loop
        timeoutId.current = setTimeout(refreshApp, performanceEnv.current.timeout);

        // Cleanup on unmount
        return () => {
            if (timeoutId.current) {
                clearTimeout(timeoutId.current);
            }
        };
    }, []);

    return (
        <table className="table table-striped latest-data">
            <tbody>
                {databases.map((database, index) => (
                    <Database key={index} database={database} />
                ))}
            </tbody>
        </table>
    );
}

// Render the app
const root = ReactDOM.createRoot(document.getElementById('app'));
root.render(<App />);
