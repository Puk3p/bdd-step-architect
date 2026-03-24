import * as vscode from 'vscode';

interface FeatureNode {
    title: string;
    description: string;
    background: StepBlock | null;
    scenarios: ScenarioNode[];
}

interface StepBlock {
    steps: StepLine[];
}

interface ScenarioNode {
    name: string;
    tags: string[];
    groups: StepGroup[];
    line: number;
}

interface StepGroup {
    steps: StepLine[];
}

interface StepLine {
    keyword: string;
    text: string;
    line: number;
}

export class FeatureGraphProvider {
    public static show(document: vscode.TextDocument): void {
        const panel = vscode.window.createWebviewPanel(
            'bddFeatureGraph',
            `🗺️ ${document.fileName.split(/[\\/]/).pop()}`,
            vscode.ViewColumn.Beside,
            { enableScripts: true, retainContextWhenHidden: true },
        );

        const feature = FeatureGraphProvider.parseFeature(document.getText());
        panel.webview.html = FeatureGraphProvider.getHtml(feature);
    }

    private static parseFeature(text: string): FeatureNode {
        const lines = text.split('\n');
        const feature: FeatureNode = { title: '', description: '', background: null, scenarios: [] };

        let i = 0;

        // Parse Feature line
        while (i < lines.length) {
            const trimmed = lines[i].trim();
            if (trimmed.startsWith('Feature:')) {
                feature.title = trimmed.replace('Feature:', '').trim();
                i++;
                break;
            }
            i++;
        }

        // Parse description lines
        const descLines: string[] = [];
        while (i < lines.length) {
            const trimmed = lines[i].trim();
            if (
                trimmed.startsWith('Background:') ||
                trimmed.startsWith('Scenario:') ||
                trimmed.startsWith('Scenario Outline:') ||
                trimmed.startsWith('@')
            ) {
                break;
            }
            if (trimmed.length > 0) {
                descLines.push(trimmed);
            }
            i++;
        }
        feature.description = descLines.join(' ');

        // Parse Background and Scenarios
        let pendingTags: string[] = [];

        while (i < lines.length) {
            const trimmed = lines[i].trim();

            if (trimmed.startsWith('@')) {
                pendingTags = trimmed.split(/\s+/).filter((t) => t.startsWith('@'));
                i++;
                continue;
            }

            if (trimmed.startsWith('Background:')) {
                i++;
                const steps: StepLine[] = [];
                while (i < lines.length) {
                    const sl = lines[i].trim();
                    if (
                        sl.startsWith('Scenario:') ||
                        sl.startsWith('Scenario Outline:') ||
                        sl.startsWith('@') ||
                        sl.startsWith('Background:')
                    ) {
                        break;
                    }
                    const stepMatch = sl.match(/^(Given|When|Then|And|But)\s+(.+)$/);
                    if (stepMatch) {
                        steps.push({ keyword: stepMatch[1], text: stepMatch[2], line: i + 1 });
                    }
                    i++;
                }
                feature.background = { steps };
                pendingTags = [];
                continue;
            }

            if (trimmed.startsWith('Scenario:') || trimmed.startsWith('Scenario Outline:')) {
                const name = trimmed.replace(/^Scenario(?:\s+Outline)?:\s*/, '');
                const scenarioLine = i + 1;
                i++;

                const groups: StepGroup[] = [];
                let currentGroup: StepLine[] = [];
                let lastKeyword = '';

                while (i < lines.length) {
                    const sl = lines[i].trim();
                    if (
                        sl.startsWith('Scenario:') ||
                        sl.startsWith('Scenario Outline:') ||
                        sl.startsWith('@') ||
                        sl.startsWith('Rule:')
                    ) {
                        break;
                    }

                    const stepMatch = sl.match(/^(Given|When|Then|And|But)\s+(.+)$/);
                    if (stepMatch) {
                        const kw = stepMatch[1];
                        const resolvedKw = kw === 'And' || kw === 'But' ? lastKeyword || kw : kw;

                        // Start a new group when we see a new primary keyword after Then
                        if (
                            currentGroup.length > 0 &&
                            (kw === 'Given' || kw === 'When') &&
                            lastKeyword !== kw &&
                            lastKeyword !== 'And' &&
                            lastKeyword !== 'But'
                        ) {
                            groups.push({ steps: currentGroup });
                            currentGroup = [];
                        }

                        currentGroup.push({ keyword: resolvedKw, text: stepMatch[2], line: i + 1 });
                        lastKeyword = kw;
                    } else if (sl === '' && currentGroup.length > 0) {
                        // Empty line can signal a new action group
                        const lastStep = currentGroup[currentGroup.length - 1];
                        if (lastStep && (lastStep.keyword === 'Then' || lastStep.keyword === 'And')) {
                            groups.push({ steps: currentGroup });
                            currentGroup = [];
                        }
                    }

                    i++;
                }

                if (currentGroup.length > 0) {
                    groups.push({ steps: currentGroup });
                }

                feature.scenarios.push({ name, tags: [...pendingTags], groups, line: scenarioLine });
                pendingTags = [];
                continue;
            }

            i++;
        }

        return feature;
    }

    private static getHtml(feature: FeatureNode): string {
        const scenariosHtml = feature.scenarios
            .map((scenario, sIdx) => {
                const tagsHtml =
                    scenario.tags.length > 0
                        ? `<div class="tags">${scenario.tags.map((t) => `<span class="tag">${FeatureGraphProvider.escapeHtml(t)}</span>`).join('')}</div>`
                        : '';

                const groupsHtml = scenario.groups
                    .map((group, gIdx) => {
                        const stepsHtml = group.steps
                            .map(
                                (step) =>
                                    `<div class="step-node ${step.keyword.toLowerCase()}">
                                        <span class="step-keyword">${FeatureGraphProvider.escapeHtml(step.keyword)}</span>
                                        <span class="step-text">${FeatureGraphProvider.escapeHtml(step.text)}</span>
                                        <span class="step-line">L${step.line}</span>
                                    </div>`,
                            )
                            .join('<div class="connector-v"></div>');

                        return `<div class="step-group">${stepsHtml}</div>${gIdx < scenario.groups.length - 1 ? '<div class="group-separator"><div class="separator-arrow">↓ next action</div></div>' : ''}`;
                    })
                    .join('');

                return `
                    <div class="scenario-card" id="scenario-${sIdx}">
                        ${tagsHtml}
                        <div class="scenario-header">
                            <span class="scenario-icon">🎬</span>
                            <span class="scenario-name">${FeatureGraphProvider.escapeHtml(scenario.name)}</span>
                        </div>
                        <div class="scenario-body">${groupsHtml}</div>
                    </div>
                `;
            })
            .join('<div class="scenario-connector"><div class="connector-line"></div></div>');

        const backgroundHtml = feature.background
            ? `<div class="background-card">
                <div class="background-header">
                    <span class="background-icon">📋</span>
                    <span>Background</span>
                </div>
                <div class="background-body">
                    ${feature.background.steps
                        .map(
                            (step) =>
                                `<div class="step-node ${step.keyword.toLowerCase()}">
                                    <span class="step-keyword">${FeatureGraphProvider.escapeHtml(step.keyword)}</span>
                                    <span class="step-text">${FeatureGraphProvider.escapeHtml(step.text)}</span>
                                    <span class="step-line">L${step.line}</span>
                                </div>`,
                        )
                        .join('<div class="connector-v"></div>')}
                </div>
            </div>
            <div class="flow-arrow">
                <div class="arrow-line"></div>
                <div class="arrow-label">runs before each scenario</div>
            </div>`
            : '';

        return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Feature Graph</title>
<style>
    :root {
        --bg: #1e1e2e;
        --surface: #282840;
        --surface-hover: #313150;
        --border: #3b3b5c;
        --text: #cdd6f4;
        --text-dim: #8888aa;
        --accent: #89b4fa;
        --given: #89b4fa;
        --when: #f9e2af;
        --then: #a6e3a1;
        --and: #cba6f7;
        --but: #fab387;
        --tag: #f38ba8;
        --shadow: rgba(0,0,0,0.3);
    }

    * { margin: 0; padding: 0; box-sizing: border-box; }

    body {
        background: var(--bg);
        color: var(--text);
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        padding: 32px;
        min-height: 100vh;
    }

    .graph-container {
        max-width: 900px;
        margin: 0 auto;
    }

    /* Feature Header */
    .feature-header {
        text-align: center;
        margin-bottom: 40px;
        padding: 28px 32px;
        background: linear-gradient(135deg, #313150 0%, #282840 100%);
        border-radius: 16px;
        border: 1px solid var(--border);
        box-shadow: 0 8px 32px var(--shadow);
        position: relative;
        overflow: hidden;
    }
    .feature-header::before {
        content: '';
        position: absolute;
        top: 0; left: 0; right: 0;
        height: 3px;
        background: linear-gradient(90deg, var(--given), var(--when), var(--then));
    }
    .feature-title {
        font-size: 22px;
        font-weight: 700;
        margin-bottom: 8px;
        color: var(--accent);
    }
    .feature-desc {
        font-size: 13px;
        color: var(--text-dim);
        line-height: 1.5;
    }
    .feature-stats {
        display: flex;
        justify-content: center;
        gap: 20px;
        margin-top: 16px;
    }
    .stat {
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: 12px;
        color: var(--text-dim);
        background: var(--bg);
        padding: 4px 12px;
        border-radius: 20px;
    }
    .stat-num {
        font-weight: 700;
        color: var(--accent);
    }

    /* Background Card */
    .background-card {
        background: var(--surface);
        border: 1px solid var(--border);
        border-radius: 12px;
        padding: 20px;
        margin-bottom: 0;
        box-shadow: 0 4px 16px var(--shadow);
        border-left: 3px solid var(--text-dim);
    }
    .background-header {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 15px;
        font-weight: 600;
        color: var(--text-dim);
        margin-bottom: 16px;
        text-transform: uppercase;
        letter-spacing: 0.5px;
    }
    .background-body {
        padding-left: 8px;
    }

    /* Flow Arrow */
    .flow-arrow {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 8px 0;
    }
    .arrow-line {
        width: 2px;
        height: 24px;
        background: repeating-linear-gradient(
            to bottom,
            var(--text-dim) 0px,
            var(--text-dim) 4px,
            transparent 4px,
            transparent 8px
        );
    }
    .arrow-label {
        font-size: 10px;
        color: var(--text-dim);
        background: var(--bg);
        padding: 2px 10px;
        border-radius: 10px;
        border: 1px solid var(--border);
        margin: 4px 0;
    }

    /* Scenario Card */
    .scenario-card {
        background: var(--surface);
        border: 1px solid var(--border);
        border-radius: 12px;
        padding: 20px;
        box-shadow: 0 4px 16px var(--shadow);
        transition: all 0.2s ease;
        position: relative;
    }
    .scenario-card:hover {
        background: var(--surface-hover);
        box-shadow: 0 8px 32px var(--shadow);
        transform: translateY(-1px);
    }
    .scenario-header {
        display: flex;
        align-items: center;
        gap: 10px;
        font-size: 16px;
        font-weight: 600;
        margin-bottom: 16px;
        padding-bottom: 12px;
        border-bottom: 1px solid var(--border);
    }
    .scenario-icon { font-size: 18px; }
    .scenario-name { color: var(--accent); }
    .scenario-body { padding-left: 8px; }

    /* Tags */
    .tags {
        display: flex;
        gap: 6px;
        flex-wrap: wrap;
        margin-bottom: 12px;
    }
    .tag {
        font-size: 11px;
        color: var(--tag);
        background: rgba(243, 139, 168, 0.1);
        border: 1px solid rgba(243, 139, 168, 0.25);
        padding: 2px 10px;
        border-radius: 20px;
        font-weight: 500;
    }

    /* Step Nodes */
    .step-node {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 8px 14px;
        border-radius: 8px;
        background: var(--bg);
        border: 1px solid var(--border);
        transition: all 0.15s ease;
        cursor: default;
    }
    .step-node:hover {
        border-color: var(--accent);
        box-shadow: 0 0 12px rgba(137, 180, 250, 0.1);
    }
    .step-keyword {
        font-size: 11px;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        min-width: 48px;
        text-align: center;
        padding: 2px 8px;
        border-radius: 4px;
        flex-shrink: 0;
    }
    .step-text {
        font-size: 13px;
        flex: 1;
        color: var(--text);
    }
    .step-line {
        font-size: 10px;
        color: var(--text-dim);
        opacity: 0.5;
        flex-shrink: 0;
    }

    /* Keyword colors */
    .step-node.given .step-keyword { color: var(--given); background: rgba(137,180,250,0.12); }
    .step-node.when .step-keyword { color: var(--when); background: rgba(249,226,175,0.12); }
    .step-node.then .step-keyword { color: var(--then); background: rgba(166,227,161,0.12); }
    .step-node.and .step-keyword { color: var(--and); background: rgba(203,166,247,0.12); }
    .step-node.but .step-keyword { color: var(--but); background: rgba(250,179,135,0.12); }

    .step-node.given { border-left: 3px solid var(--given); }
    .step-node.when { border-left: 3px solid var(--when); }
    .step-node.then { border-left: 3px solid var(--then); }
    .step-node.and { border-left: 3px solid var(--and); }
    .step-node.but { border-left: 3px solid var(--but); }

    /* Connectors */
    .connector-v {
        display: flex;
        justify-content: center;
        padding: 2px 0;
    }
    .connector-v::after {
        content: '';
        display: block;
        width: 2px;
        height: 10px;
        background: var(--border);
        border-radius: 1px;
    }

    /* Step Group */
    .step-group {
        margin-bottom: 4px;
    }

    .group-separator {
        display: flex;
        justify-content: center;
        padding: 6px 0;
    }
    .separator-arrow {
        font-size: 10px;
        color: var(--text-dim);
        background: var(--surface);
        padding: 2px 12px;
        border-radius: 10px;
        border: 1px dashed var(--border);
    }

    /* Scenario Connector */
    .scenario-connector {
        display: flex;
        justify-content: center;
        padding: 4px 0;
    }
    .connector-line {
        width: 2px;
        height: 20px;
        background: var(--border);
        border-radius: 1px;
    }

    /* Legend */
    .legend {
        display: flex;
        justify-content: center;
        gap: 16px;
        flex-wrap: wrap;
        margin-top: 32px;
        padding: 14px 20px;
        background: var(--surface);
        border-radius: 10px;
        border: 1px solid var(--border);
    }
    .legend-item {
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: 11px;
        color: var(--text-dim);
    }
    .legend-dot {
        width: 10px;
        height: 10px;
        border-radius: 3px;
    }
    .legend-dot.given { background: var(--given); }
    .legend-dot.when { background: var(--when); }
    .legend-dot.then { background: var(--then); }
    .legend-dot.and { background: var(--and); }
    .legend-dot.but { background: var(--but); }

    /* Toolbar */
    .toolbar {
        display: flex;
        justify-content: flex-end;
        gap: 8px;
        margin-bottom: 20px;
    }
    .toolbar button {
        background: var(--surface);
        color: var(--text-dim);
        border: 1px solid var(--border);
        padding: 6px 14px;
        border-radius: 6px;
        cursor: pointer;
        font-size: 12px;
        transition: all 0.15s ease;
    }
    .toolbar button:hover {
        background: var(--surface-hover);
        color: var(--text);
        border-color: var(--accent);
    }

    /* Collapse */
    .scenario-body.collapsed { display: none; }
    .collapse-btn {
        position: absolute;
        top: 16px;
        right: 16px;
        background: none;
        border: 1px solid var(--border);
        color: var(--text-dim);
        width: 24px;
        height: 24px;
        border-radius: 4px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 12px;
        transition: all 0.15s ease;
    }
    .collapse-btn:hover {
        background: var(--surface-hover);
        color: var(--text);
    }
</style>
</head>
<body>
<div class="graph-container">
    <div class="feature-header">
        <div class="feature-title">📐 ${FeatureGraphProvider.escapeHtml(feature.title)}</div>
        <div class="feature-desc">${FeatureGraphProvider.escapeHtml(feature.description)}</div>
        <div class="feature-stats">
            <div class="stat"><span class="stat-num">${feature.scenarios.length}</span> scenarios</div>
            <div class="stat"><span class="stat-num">${feature.scenarios.reduce((sum, s) => sum + s.groups.reduce((gs, g) => gs + g.steps.length, 0), 0)}</span> steps</div>
            ${feature.background ? '<div class="stat"><span class="stat-num">1</span> background</div>' : ''}
        </div>
    </div>

    <div class="toolbar">
        <button onclick="expandAll()">📂 Expand All</button>
        <button onclick="collapseAll()">📁 Collapse All</button>
    </div>

    ${backgroundHtml}
    ${scenariosHtml}

    <div class="legend">
        <div class="legend-item"><div class="legend-dot given"></div>Given</div>
        <div class="legend-item"><div class="legend-dot when"></div>When</div>
        <div class="legend-item"><div class="legend-dot then"></div>Then</div>
        <div class="legend-item"><div class="legend-dot and"></div>And</div>
        <div class="legend-item"><div class="legend-dot but"></div>But</div>
    </div>
</div>

<script>
    document.querySelectorAll('.scenario-card').forEach(card => {
        const body = card.querySelector('.scenario-body');
        const btn = document.createElement('button');
        btn.className = 'collapse-btn';
        btn.textContent = '−';
        btn.onclick = () => {
            body.classList.toggle('collapsed');
            btn.textContent = body.classList.contains('collapsed') ? '+' : '−';
        };
        card.appendChild(btn);
    });

    function collapseAll() {
        document.querySelectorAll('.scenario-body').forEach(b => b.classList.add('collapsed'));
        document.querySelectorAll('.collapse-btn').forEach(b => b.textContent = '+');
    }

    function expandAll() {
        document.querySelectorAll('.scenario-body').forEach(b => b.classList.remove('collapsed'));
        document.querySelectorAll('.collapse-btn').forEach(b => b.textContent = '−');
    }
</script>
</body>
</html>`;
    }

    private static escapeHtml(str: string): string {
        return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }
}
