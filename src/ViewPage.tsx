import { classNamesFunction, IStyle, Theme, useTheme } from '@fluentui/react';
import React, { useEffect } from 'react';
import { useLoaderData, LoaderFunction } from 'react-router-dom';
import { textToScene } from './file';
import { ViewHotkeyHandler } from './HotkeyHandler';
import { SceneRenderer } from './render/SceneRenderer';
import { Scene } from './scene';
import { SceneProvider, useScene } from './SceneProvider';
import { StepSelect } from './StepSelect';
import { useIsDirty } from './useIsDirty';

interface IContentStyles {
    stage: IStyle;
}
const getClassNames = classNamesFunction<Theme, IContentStyles>();

interface ViewPageLoaderData {
    initialScene: Scene | undefined;
}

export const loader: LoaderFunction = async ({ params }) => {
    let data;
    switch (params.provider) {
        case 'gist':
            const res = await fetch(`https://api.github.com/gists/${params.data!}`);
            const json = await res.json();
            data = json.files['data.txt'].content;
            break;

        case 'data':
        case undefined:
            data = decodeURIComponent(params.data!);
            break;
    }
    const initialScene = data ? textToScene(data) : undefined;
    const result: ViewPageLoaderData = {
        initialScene,
    };
    return result;
}

export const ViewPage: React.FC = () => {
    const { initialScene } = useLoaderData() as ViewPageLoaderData;
    return (
        <SceneProvider initialScene={initialScene}>
            <ViewPageContent />
        </SceneProvider>
    );
};

const ViewPageContent: React.FC = () => {
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
            <ViewHotkeyHandler />
            <StepSelect readonly />
            <div className={classNames.stage}>
                <SceneRenderer />
            </div>
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
