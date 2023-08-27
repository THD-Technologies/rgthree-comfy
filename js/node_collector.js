import { app } from "../../scripts/app.js";
import { addConnectionLayoutSupport } from "./utils.js";
class CollectorNode extends LGraphNode {
    constructor(title = CollectorNode.title) {
        super(title);
        this.isVirtualNode = true;
        this.properties = this.properties || {};
        this.connections = [];
        this.addInput("", "*");
        this.addOutput("Output", "*");
    }
    clone() {
        const cloned = super.clone();
        return cloned;
    }
    updateOutputLinks(startNode = this) {
        const type = startNode.constructor.type;
        if (startNode.onConnectionsChainChange) {
            startNode.onConnectionsChainChange();
        }
        if (startNode === this || (type === null || type === void 0 ? void 0 : type.includes('Reroute')) || (type === null || type === void 0 ? void 0 : type.includes('Combiner'))) {
            for (const output of startNode.outputs) {
                if (!output.links || !output.links.length)
                    continue;
                for (const linkId of output.links) {
                    const link = app.graph.links[linkId];
                    const targetNode = app.graph.getNodeById(link.target_id);
                    targetNode && this.updateOutputLinks(targetNode);
                }
            }
        }
    }
    onConnectionsChange(_type, _slotIndex, _isConnected, link_info, _ioSlot) {
        if (!link_info)
            return;
        this.stabilizeInputsOutputs();
        this.updateOutputLinks();
    }
    stabilizeInputsOutputs() {
        var _a, _b;
        for (let index = this.inputs.length - 1; index >= 0; index--) {
            const input = this.inputs[index];
            if (!input.link) {
                this.removeInput(index);
            }
        }
        this.addInput('', '*');
        const outputLength = ((_b = (_a = this.outputs[0]) === null || _a === void 0 ? void 0 : _a.links) === null || _b === void 0 ? void 0 : _b.length) || 0;
        if (outputLength > 1) {
            this.outputs[0].links.length = 1;
        }
    }
}
CollectorNode.legacyType = "Node Combiner (rgthree)";
CollectorNode.title = "Node Collector (rgthree)";
CollectorNode.category = 'rgthree';
CollectorNode._category = 'rgthree';
class CombinerNode extends CollectorNode {
}
CombinerNode.legacyType = "Node Combiner (rgthree)";
CombinerNode.title = "Node Combiner (rgthree)";
app.registerExtension({
    name: "rgthree.NodeCollector",
    registerCustomNodes() {
        addConnectionLayoutSupport(CollectorNode, app, [['Left', 'Right'], ['Right', 'Left']]);
        LiteGraph.registerNodeType(CollectorNode.title, CollectorNode);
        CollectorNode.category = CollectorNode._category;
    },
});
app.registerExtension({
    name: "rgthree.NodeCombiner",
    registerCustomNodes() {
        addConnectionLayoutSupport(CombinerNode, app, [['Left', 'Right'], ['Right', 'Left']]);
        LiteGraph.registerNodeType(CombinerNode.legacyType, CombinerNode);
        CombinerNode.category = CombinerNode._category;
    },
});
