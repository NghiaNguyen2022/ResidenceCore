'use client';

import RoutineItemList from './RoutineItemList';
import RoutineTemplateList from './RoutineTemplateList';

type DayTypeFilter = 'all' | 'weekday' | 'sunday' | 'special';

type RoutineSetupTabProps = {
      templates: any[];
      currentTemplate?: any | null;
      items: any[];
      templatesLoading?: boolean;
      itemsLoading?: boolean;

      searchTerm: string;
      onSearchTermChange: (value: string) => void;
      dayTypeFilter: DayTypeFilter;
      onDayTypeFilterChange: (value: DayTypeFilter) => void;

      onSelectTemplate: (templateId: number) => void;
      onCreateTemplate: () => void;
      onEditTemplate: (template: any) => void;
      onRemoveTemplate: (template: any) => void;

      onCreateItem: () => void;
      onEditItem: (item: any) => void;
      onRemoveItem: (item: any) => void;
};

export function RoutineSetupTab({
      templates,
      currentTemplate,
      items,
      templatesLoading,
      itemsLoading,
      searchTerm,
      onSearchTermChange,
      dayTypeFilter,
      onDayTypeFilterChange,
      onSelectTemplate,
      onCreateTemplate,
      onEditTemplate,
      onRemoveTemplate,
      onCreateItem,
      onEditItem,
      onRemoveItem,
}: RoutineSetupTabProps) {
      return (
            <div className="grid gap-6 xl:grid-cols-[360px_1fr]">
                  <RoutineTemplateList
                        templates={templates}
                        currentTemplate={currentTemplate}
                        isLoading={templatesLoading}
                        searchTerm={searchTerm}
                        onSearchTermChange={onSearchTermChange}
                        dayTypeFilter={dayTypeFilter}
                        onDayTypeFilterChange={onDayTypeFilterChange}
                        onSelectTemplate={onSelectTemplate}
                        onCreateTemplate={onCreateTemplate}
                        onEditTemplate={onEditTemplate}
                        onRemoveTemplate={onRemoveTemplate}
                  />

                  <RoutineItemList
                        currentTemplate={currentTemplate}
                        items={items}
                        isLoading={itemsLoading}
                        onCreateItem={onCreateItem}
                        onEditItem={onEditItem}
                        onRemoveItem={onRemoveItem}
                  />
            </div>
      );
}

export default RoutineSetupTab;
