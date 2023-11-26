import { classNamesFunction, IStyle, Theme, useTheme } from '@fluentui/react';
import React, { useEffect, useMemo } from 'react';
import { useLocation, useSearchParams, useLoaderData } from 'react-router-dom';
import { DirtyProvider } from './DirtyProvider';
import { EditModeProvider } from './EditModeProvider';
import { textToScene } from './file';
import { RegularHotkeyHandler } from './HotkeyHandler';
import { MainCommandBar } from './MainCommandBar';
import { DetailsPanel } from './panel/DetailsPanel';
import { MainPanel } from './panel/MainPanel';
import { PanelDragProvider } from './PanelDragProvider';
import { SceneRenderer } from './render/SceneRenderer';
import { SceneProvider, useScene } from './SceneProvider';
import { SelectionProvider } from './SelectionProvider';
import { StepSelect } from './StepSelect';
import { useIsDirty } from './useIsDirty';

interface IContentStyles {
    stage: IStyle;
}
const getClassNames = classNamesFunction<Theme, IContentStyles>();

export async function loader({ params }) {
    let data;
    switch (params.provider) {
        case 'gist':
            const res = await fetch(`https://api.github.com/gists/${params.data}`);
            const json = await res.json();
            data = json.files['data.txt'].content;
            break;

        case 'data':
        case undefined:
            data = decodeURIComponent(params.data);
            break;
    }
    const initialScene = data ? textToScene(data) : undefined;
    return { initialScene };
}

export async function legacyLoader({ request }) {
    let data;
    const url = new URL(request.url);
    const param = url.searchParams.get('plan');
    if (param) {
        data = decodeURIComponent(param);
    }
    const initialScene = data ? textToScene(data) : undefined;
    return { initialScene };
}

export const MainPage: React.FC<MainPageProps> = () => {
    const { initialScene } = useLoaderData();
    return (
        <SceneProvider initialScene={initialScene}>
            <DirtyProvider>
                <EditModeProvider>
                    <SelectionProvider>
                        <PanelDragProvider>
                            <MainPageContent />
                        </PanelDragProvider>
                    </SelectionProvider>
                </EditModeProvider>
            </DirtyProvider>
        </SceneProvider>
    );
};

const MainPageContent: React.FC = () => {
    usePageTitle();
    const theme = useTheme();
    const classNames = getClassNames(() => {
        return {
            stage: {
                gridArea: 'content',
                overflow: 'auto',
                backgroundColor: theme.palette.neutralLighter,
                minWidth: 400,
            },
        };
    }, theme);

    return (
        <>
            <RegularHotkeyHandler />
            <MainCommandBar />

            <MainPanel />

            <StepSelect />

            <div className={classNames.stage}>
                <SceneRenderer />
            </div>

            <DetailsPanel />
        </>
    );
};

const DEFAULT_TITLE = 'FFXIV Raid Planner';

function usePageTitle() {
    const { source } = useScene();
    const isDirty = useIsDirty();

    useEffect(() => {
        const name = source?.name ?? DEFAULT_TITLE;
        const flag = isDirty ? ' ●' : '';
        document.title = `${name}${flag}`;
    }, [source, isDirty]);
}
