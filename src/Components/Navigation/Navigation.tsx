import { styles } from "./styles";
import { Buttons } from "../Button/Button";

const NAV_ITEMS = [
    { label: "Dashboard", path: "/" },
    { label: "Calendar", path: "/calendar" },
    { label: "Weather", path: "/weather" },
    { label: "Reminders", path: "/reminders" },
    { label: "Settings", path: "/settings" },
] as const;

export const Navigation = () => {

    return (
        <nav style={styles.nav}>
            {NAV_ITEMS.map(({ label, path }) => (
                <Buttons.nav
                    key={path}
                    title={label}
                    onClick={() => {}}
                    onNavigateTo={path}
                /> 
            ))}
        </nav>
    );
};
