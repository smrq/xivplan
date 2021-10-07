import { Stack } from '@fluentui/react';
import React, { useCallback, useMemo } from 'react';
import { Rect } from 'react-konva';
import lineIcon from '../../assets/zone/line.png';
import squareIcon from '../../assets/zone/square.png';
import { CompactColorPicker } from '../../CompactColorPicker';
import { OpacitySlider } from '../../OpacitySlider';
import { DetailsItem } from '../../panel/DetailsItem';
import { ListComponentProps, registerListComponent } from '../../panel/ObjectList';
import { PropertiesControlProps, registerPropertiesControl } from '../../panel/PropertiesPanel';
import { getDragOffset, registerDropHandler, usePanelDrag } from '../../PanelDragProvider';
import { useCanvasCoord } from '../../render/coord';
import { registerRenderer, RendererProps } from '../../render/ObjectRenderer';
import { GroundPortal } from '../../render/Portals';
import { AOE_COLOR_SWATCHES, DEFAULT_AOE_COLOR, DEFAULT_AOE_OPACITY } from '../../render/SceneTheme';
import { ObjectType, RectangleZone } from '../../scene';
import { useScene } from '../../SceneProvider';
import { ResizeableObjectProperties } from '../CommonProperties';
import { PrefabIcon } from '../PrefabIcon';
import { getZoneStyle } from './style';

const DEFAULT_SQUARE_SIZE = 150;

export const ZoneSquare: React.FunctionComponent = () => {
    const [, setDragObject] = usePanelDrag();
    return (
        <PrefabIcon
            draggable
            name="Square AOE"
            icon={squareIcon}
            onDragStart={(e) => {
                setDragObject({
                    object: {
                        type: ObjectType.Rect,
                        width: DEFAULT_SQUARE_SIZE,
                        height: DEFAULT_SQUARE_SIZE,
                    },
                    offset: getDragOffset(e),
                });
            }}
        />
    );
};

const DEFAULT_LINE_WIDTH = 50;
const DEFAULT_LINE_HEIGHT = 250;

export const ZoneLine: React.FunctionComponent = () => {
    const [, setDragObject] = usePanelDrag();
    return (
        <PrefabIcon
            draggable
            name="Line AOE"
            icon={lineIcon}
            onDragStart={(e) => {
                setDragObject({
                    object: {
                        type: ObjectType.Rect,
                        width: DEFAULT_LINE_WIDTH,
                        height: DEFAULT_LINE_HEIGHT,
                    },
                    offset: getDragOffset(e),
                });
            }}
        />
    );
};

registerDropHandler<RectangleZone>(ObjectType.Rect, (object, position) => {
    return {
        type: 'add',
        object: {
            type: ObjectType.Rect,
            color: DEFAULT_AOE_COLOR,
            opacity: DEFAULT_AOE_OPACITY,
            width: DEFAULT_SQUARE_SIZE,
            height: DEFAULT_SQUARE_SIZE,
            rotation: 0,
            ...object,
            ...position,
        },
    };
});

const RectangleRenderer: React.FC<RendererProps<RectangleZone>> = ({ object }) => {
    const center = useCanvasCoord(object);
    const style = useMemo(
        () => getZoneStyle(object.color, object.opacity, Math.min(object.width, object.height)),
        [object.color, object.opacity, object.width, object.height],
    );

    return (
        <GroundPortal>
            <Rect
                x={center.x}
                y={center.y}
                offsetX={object.width / 2}
                offsetY={object.height / 2}
                width={object.width}
                height={object.height}
                rotation={object.rotation}
                {...style}
            />
        </GroundPortal>
    );
};

registerRenderer<RectangleZone>(ObjectType.Rect, RectangleRenderer);

const RectangleDetails: React.FC<ListComponentProps<RectangleZone>> = ({ index }) => {
    // TODO: color filter icon?
    return <DetailsItem icon={squareIcon} name="Rectangle" index={index} />;
};

registerListComponent<RectangleZone>(ObjectType.Rect, RectangleDetails);

const RectangleEditControl: React.FC<PropertiesControlProps<RectangleZone>> = ({ object, index }) => {
    const [, dispatch] = useScene();

    const onColorChanged = useCallback(
        (color: string) => dispatch({ type: 'update', index, value: { ...object, color } }),
        [dispatch, object, index],
    );

    const onOpacityChanged = useCallback(
        (opacity: number) => dispatch({ type: 'update', index, value: { ...object, opacity } }),
        [dispatch, object, index],
    );

    return (
        <Stack>
            <CompactColorPicker
                label="Color"
                color={object.color}
                swatches={AOE_COLOR_SWATCHES}
                onChange={onColorChanged}
            />
            <OpacitySlider value={object.opacity} onChange={onOpacityChanged} />
            <ResizeableObjectProperties object={object} index={index} />
        </Stack>
    );
};

registerPropertiesControl<RectangleZone>(
    [ObjectType.Rect, ObjectType.LineStack, ObjectType.LineKnockback, ObjectType.LineKnockAway],
    RectangleEditControl,
);