import { useState, createContext, useContext, useId } from "react";

/**
 * Tabs — bergaya shadcn/ui.
 *
 * Pemakaian:
 *   <Tabs defaultValue="a">
 *     <TabsList>
 *       <TabsTrigger value="a">Tab A</TabsTrigger>
 *       <TabsTrigger value="b">Tab B</TabsTrigger>
 *     </TabsList>
 *     <TabsContent value="a">...</TabsContent>
 *     <TabsContent value="b">...</TabsContent>
 *   </Tabs>
 */
const TabsCtx = createContext(null);

export function Tabs({ defaultValue, value, onValueChange, children, className = "" }) {
  const [internal, setInternal] = useState(defaultValue);
  const active = value !== undefined ? value : internal;
  const baseId = useId();

  const setActive = (v) => {
    if (value === undefined) setInternal(v);
    onValueChange?.(v);
  };

  return (
    <TabsCtx.Provider value={{ active, setActive, baseId }}>
      <div className={`sc-tabs ${className}`} data-shadcn="Tabs">
        {children}
      </div>
    </TabsCtx.Provider>
  );
}

export function TabsList({ children, className = "" }) {
  return (
    <div className={`sc-tabs-list ${className}`} role="tablist">
      {children}
    </div>
  );
}

export function TabsTrigger({ value, icon, children, className = "" }) {
  const { active, setActive, baseId } = useContext(TabsCtx);
  const selected = active === value;
  return (
    <button
      type="button"
      role="tab"
      aria-selected={selected}
      aria-controls={`${baseId}-${value}`}
      className={`sc-tabs-trigger ${selected ? "active" : ""} ${className}`}
      onClick={() => setActive(value)}
    >
      {icon && <span className="sc-tabs-icon">{icon}</span>}
      {children}
    </button>
  );
}

export function TabsContent({ value, children, className = "" }) {
  const { active, baseId } = useContext(TabsCtx);
  if (active !== value) return null;
  return (
    <div
      role="tabpanel"
      id={`${baseId}-${value}`}
      className={`sc-tabs-content ${className}`}
    >
      {children}
    </div>
  );
}

export default Tabs;
