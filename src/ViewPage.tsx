import { makeStyles, tokens } from '@fluentui/react-components';
import React from 'react';
import { LoaderFunction, useLoaderData } from 'react-router-dom';
import { ViewHotkeyHandler } from './HotkeyHandler';
// import { PanelDragProvider } from './PanelDragProvider';
import { SceneLoadErrorNotifier } from './SceneLoadErrorNotifier';
import { SceneProvider, useScene } from './SceneProvider';
import { StepSelect } from './StepSelect';
import { textToScene } from './file';
import { SceneRenderer } from './render/SceneRenderer';
import { MIN_STAGE_WIDTH } from './theme';
import { removeFileExtension } from './util';

export const loader: LoaderFunction = async ({ params }) => {
    let data;
    switch (params.provider) {
        case 'gist':
            const res = await fetch(`https://api.github.com/gists/${params.data}`);
            const json = await res.json();
            data = json.files['data.txt'].content;
            break;

        case 'data':
        case undefined:
            data = decodeURIComponent(params.data ?? '');
            break;
    }
    const initialScene = data ? textToScene(data) : undefined;
    return { initialScene };
}

export const ViewPage: React.FC = () => {
    const { initialScene } = useLoaderData();
    return (
        <SceneProvider initialScene={initialScene}>
            <ViewPageContent />
        </SceneProvider>
    );
};

const ViewPageContent: React.FC = () => {
    const classes = useStyles();
    const title = usePageTitle();

    return (
        <>
            <title>{title}</title>

            <ViewHotkeyHandler />
            <SceneLoadErrorNotifier />
            <StepSelect />
            <div className={classes.stage}>
                <SceneRenderer />
            </div>
        </>
    );
};

const TITLE = 'FFXIV Raid Planner';

function usePageTitle() {
    const { source } = useScene();

    let title = TITLE;
    if (source) {
        title += ': ';
        title += removeFileExtension(source?.name);
    }
    return title;
}

const useStyles = makeStyles({
    stage: {
        gridArea: 'content',
        display: 'flex',
        flexFlow: 'row',
        justifyContent: 'center',
        overflow: 'auto',
        minWidth: MIN_STAGE_WIDTH,
        backgroundColor: tokens.colorNeutralBackground1,
    },
});
