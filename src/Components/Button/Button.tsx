import { useLocation, useNavigate } from "react-router-dom";


export const Buttons = {
    main: ({ title, onClick, style }: { title: string; onClick: () => void; style?: React.CSSProperties }) => baseBtn({ title, onClick, style }),
    nav: ({ title, onClick, onNavigateTo, style }: { title: string; onClick: () => void; onNavigateTo: string; style?: React.CSSProperties }) => baseBtn({ title, onClick, onNavigateTo, style }),
    cam: ({ title, onClick, style }: { title: string; onClick: () => void; style?: React.CSSProperties }) => baseBtn({ title, onClick, style }),
}


interface BaseBtnProps {
    title: string;
    onClick: () => void;
    onNavigateTo?: string;
    style?: React.CSSProperties;
}

const baseBtn = ({ title, onClick, onNavigateTo, style }: BaseBtnProps) => {

    const navigate = useNavigate();
    const { pathname } = useLocation();

    return <button onClick={() => {
        if (onNavigateTo) navigate(onNavigateTo);
        onClick();
    }} style={onNavigateTo ? {
        ...styles.navButton,
        ...(pathname === onNavigateTo ? styles.navButtonActive : {}),
        ...style,
    } : style}>{title}</button>;
}


const styles = {
    navButton: {
        flex: 1,
        padding: "14px 4px",
        background: "transparent",
        border: "none",
        color: "#555",
        fontSize: 13,
        fontWeight: 500,
        cursor: "pointer",
        letterSpacing: "0.03em",
        textTransform: "uppercase",
        touchAction: "manipulation",
        WebkitTapHighlightColor: "transparent",
    },
    navButtonActive: {
        color: "#fff",
    }
}