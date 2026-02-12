import "../../Styles/BottomBar.css"
import { observer } from "mobx-react-lite";
import { stateManager } from "../../managers/StateManager";

export const BottomBar = observer(() => {
    const { designManager } = stateManager;
    const { baseManager, topManager, topColorManager, chairManager } = designManager;

    const selectedBase = baseManager.selectedBase
    const selectedTop = topManager.selectedTop
    const selectedTopColor = topColorManager.selectedTopColor
    const selectedChair = chairManager.selectedChair
    const selectedChairColor = chairManager.selectedChairColor

    const getDimensions = () => {
        const shape = selectedTop?.name?.toLowerCase() || "";
        if (shape.includes("round")) {
            return `Ø ${topManager.topDiameter}`;
        }
        if (shape.includes("square")) {
            return `${topManager.topSize} x ${topManager.topSize}`;
        }
        return `${topManager.topLength} x ${topManager.topWidth}`;
    };

    return (
        <div id="bottom">
            <div className="bottom-item">
                <span>Your Build</span>
                <span>Dining Table</span>
            </div>

            <div className="bottom-item">
                <span>Table Top</span>
                <span>{selectedTopColor?.name || "N/A"}</span>
            </div>

            <div className="bottom-item">
                <span>Table Base</span>
                <span>{selectedBase?.label || "N/A"}</span>
            </div>

            <div className="bottom-item">
                <span>Table Base Colour</span>
                <span>{selectedBase?.color1?.name || "N/A"}</span>
            </div>

            <div className="bottom-item">
                <span>Dimensions (mm)</span>
                <span>{getDimensions()}</span>
            </div>

            <div className="bottom-item">
                <span>Table Top Shape</span>
                <span>{selectedTop?.name || "N/A"}</span>
            </div>

            <div className="bottom-item">
                <span>Chair Style</span>
                <span>
                    {chairManager.chairQuantity > 0 ? (selectedChair?.name || "N/A") : "N/A"}
                </span>
            </div>

            <div className="bottom-item">
                <span>Chair Color</span>
                <span>
                    {chairManager.chairQuantity > 0 ? (selectedChairColor?.name || "N/A") : "N/A"}
                </span>
            </div>
        </div>
    )
})