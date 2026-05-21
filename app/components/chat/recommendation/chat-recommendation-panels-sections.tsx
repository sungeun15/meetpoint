import type { ReactNode } from "react";

import {
    ChatDepartureSettingsPanel,
} from "../departure/chat-departure-settings-panel";
import {
    ChatRecommendationMapPanel,
} from "./map/chat-recommendation-map-panel";
import {
    ChatRecommendationResultsPanel,
} from "./results/chat-recommendation-results-panel";
import type {
    RecommendationPanelsGridProps,
    RecommendationDepartureSettingsSectionPanelProps,
    RecommendationMapSectionPanelProps,
    RecommendationResultsSectionPanelProps,
} from "./chat-recommendation-flow-helpers";

type RecommendationPanelSectionShellProps = {
    className: string;
    children: ReactNode;
};

function RecommendationPanelSectionShell({
    className,
    children,
}: RecommendationPanelSectionShellProps) {
    return <div className={className}>{children}</div>;
}

export function RecommendationPanelsGrid({
    departureSettingsSectionProps,
    recommendationResultsSectionProps,
    recommendationMapSectionProps,
}: RecommendationPanelsGridProps) {
    return (
        <div className="grid gap-2 sm:gap-3 lg:grid-cols-[minmax(0,1.14fr)_minmax(0,0.86fr)] lg:items-stretch lg:gap-4 xl:grid-cols-[minmax(0,0.94fr)_minmax(0,1.06fr)]">
            <RecommendationDepartureSettingsSection {...departureSettingsSectionProps} />
            <RecommendationResultsSection {...recommendationResultsSectionProps} />
            <RecommendationMapSection {...recommendationMapSectionProps} />
        </div>
    );
}

export function RecommendationDepartureSettingsSection({
    panelKey,
    viewState,
    actions,
}: RecommendationDepartureSettingsSectionPanelProps) {
    return (
        <RecommendationPanelSectionShell className="lg:col-span-2">
            <ChatDepartureSettingsPanel key={panelKey} viewState={viewState} actions={actions} />
        </RecommendationPanelSectionShell>
    );
}

export function RecommendationResultsSection(props: RecommendationResultsSectionPanelProps) {
    return (
        <RecommendationPanelSectionShell className="min-w-0 h-full xl:sticky xl:top-4">
            <ChatRecommendationResultsPanel {...props} />
        </RecommendationPanelSectionShell>
    );
}

export function RecommendationMapSection(props: RecommendationMapSectionPanelProps) {
    return (
        <RecommendationPanelSectionShell className="min-w-0 h-full">
            <ChatRecommendationMapPanel {...props} />
        </RecommendationPanelSectionShell>
    );
}