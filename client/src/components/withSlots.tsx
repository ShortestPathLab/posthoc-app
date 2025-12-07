/* eslint-disable react/display-name */
/* eslint-disable react/prop-types */
/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Children,
  ComponentType,
  createElement,
  isValidElement,
  memo,
  useMemo,
} from "react";

// Extendable type
type SlotPropsExtends = Record<string, Record<string, any>>;
type OwnPropsExtends = Record<string, any>;

type WrappedComponent<
  Props extends OwnPropsExtends,
  Components extends SlotPropsExtends,
> = ComponentType<
  Props & {
    slotProps: Partial<Components>;
  }
>;

type ResultComponentExtraComponents<Components extends SlotPropsExtends> = {
  [key in keyof Components]: ComponentType<Components[key]>;
};

// Component with included extra components
type ResultComponent<
  SlotProps extends SlotPropsExtends,
  Props extends OwnPropsExtends = OwnPropsExtends,
> = ComponentType<Props & { propagateSlotProps?: Partial<SlotProps> }> &
  ResultComponentExtraComponents<SlotProps>;

// Main function interface
export type WithSlot = {
  <
    Slots extends SlotPropsExtends,
    Props extends OwnPropsExtends = OwnPropsExtends,
  >(
    Component: WrappedComponent<Props, Slots>,
  ): ResultComponent<Slots, Props>;
};

/**
 * Some known keys to exclude. Just performance optimization
 */
const EXCLUDED_NAMES = [
  // Excluded by uppercase check
  // '__docgenInfo',
  // '$$typeof',
  // 'childContextTypes',
  // 'contextType',
  // 'contextTypes',
  // 'defaultProps',
  // 'displayName',
  // 'getDefaultProps',
  // 'getDerivedStateFromProps',
  // 'propTypes',
  // 'tag',
  // 'toJSON',
  "PropTypes",
];

/**
 * Helpers
 */
const getSlotProps = (children: any) =>
  Children.toArray(children).reduce<SlotPropsExtends>((curr, child) => {
    // console.log(child, isValidElement(child));
    if (isValidElement(child)) {
      const tag: string = (child.type as any).displayName;

      curr[tag] = child.props as Record<string, unknown>;
    }
    return curr;
  }, {});

const getCleanChildren = (children: any, slotKeys: string[]) => {
  const res = Children.toArray(children).filter((child) => {
    if (isValidElement(child)) {
      const tag: string = (child.type as any).displayName;
      return !slotKeys?.includes(tag);
    }
    return true;
  });
  return res.length > 0 ? res : undefined;
};

const isComponentName = (name: any) =>
  typeof name === "string" &&
  !EXCLUDED_NAMES.includes(name) &&
  name.match(/^[A-Z0-9]/);

const createResultComponent = (
  Component: WrappedComponent<any, any>,
): WrappedComponent<any, any> => {
  const ResultComponent: WrappedComponent<any, any> = memo((props) => {
    const {
      children,
      propagateSlotProps,
      slotKeys = [],
      ...otherProps
    } = props;

    // Find and get out all childProps
    const slotProps = useMemo(
      () => getSlotProps(children),
      [slotKeys, children],
    );
    // Clean children from childProps components
    const cleanChildren = useMemo(
      () => getCleanChildren(children, slotKeys),
      [slotKeys, children],
    );

    const passProps = useMemo(
      () => ({
        ...otherProps,
        slotProps: { ...propagateSlotProps, ...slotProps },
      }),
      [otherProps, slotProps, propagateSlotProps],
    );

    return createElement(Component, passProps, cleanChildren);
  });

  return ResultComponent;
};
/**
 * Main
 */

export const withSlots: WithSlot = (Component) => {
  const ResultComponent = memo(createResultComponent(Component));
  ResultComponent.displayName = `WithSlots(${
    Component.displayName || Component.name
  })`;

  const ProxyComponent = new Proxy(ResultComponent, {
    get(target: any, key, receiver) {
      //   console.log(target, key, receiver);
      if (key in target || typeof key === "symbol" || !isComponentName(key)) {
        return Reflect.get(target, key, receiver);
      }

      const slotKeys = Reflect.get(target, "defaultProps")?.slotKeys || [];
      const cmp = Reflect.get(target, key);
      //   console.log(target, key);
      if (!cmp) {
        // console.log("hi");
        const NullComponent: React.FC = () => null;
        NullComponent.displayName = key as string;
        Reflect.set(target, key, NullComponent);
      }
      //   console.log("hi1");

      Reflect.set(target, "defaultProps", {
        ...target.defaultProps,
        slotKeys: [...slotKeys, key],
      });

      return Reflect.get(target, key, receiver);
    },
  });

  return ProxyComponent;
};
