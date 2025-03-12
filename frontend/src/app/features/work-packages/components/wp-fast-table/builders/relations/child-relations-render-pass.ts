import { Injector } from '@angular/core';
import { WorkPackageResource } from 'core-app/features/hal/resources/work-package-resource';
import { QueryColumn, queryColumnTypes } from 'core-app/features/work-packages/components/wp-query/query-column';
import {
  WorkPackageRelationsService,
} from 'core-app/features/work-packages/components/wp-relations/wp-relations.service';
import { WorkPackageTable } from 'core-app/features/work-packages/components/wp-fast-table/wp-fast-table';
import {
  WorkPackageViewColumnsService,
} from 'core-app/features/work-packages/routing/wp-view-base/view-services/wp-view-columns.service';
import {
  RelationColumnType,
  WorkPackageViewRelationColumnsService,
} from 'core-app/features/work-packages/routing/wp-view-base/view-services/wp-view-relation-columns.service';
import { InjectField } from 'core-app/shared/helpers/angular/inject-field.decorator';
import { RelationResource } from 'core-app/features/hal/resources/relation-resource';
import { relationGroupClass, RelationRowBuilder } from './relation-row-builder';
import { PrimaryRenderPass, RowRenderInfo } from '../primary-render-pass';
import { States } from 'core-app/core/states/states.service';
import { I18nService } from 'core-app/core/i18n/i18n.service';
import {
  RelationRenderInfo,
  RelationsRenderPass,
} from 'core-app/features/work-packages/components/wp-fast-table/builders/relations/relations-render-pass';
import { state } from '@angular/animations';

export class ChildRelationsRenderPass extends RelationsRenderPass {
  renderType = 'child_relations';

  label = this.I18n.t('js.relation_labels.child');

  public render() {
    // If no relation column active, skip this pass
    if (!this.isApplicable) {
      return;
    }

    // Render for each original row, clone it since we're modifying the tablepass
    const rendered = _.clone(this.tablePass.renderedOrder);
    rendered.forEach((row:RowRenderInfo) => {
      // We only care for rows that are natural work packages
      if (!row.workPackage) {
        return;
      }

      // If the work package has no children, ignore
      const { workPackage } = row;
      if (workPackage.children?.length === 0) {
        return;
      }

      // Only if the work package has anything expanded
      const expanded = this.wpTableRelationColumns.getExpandFor(workPackage.id!);
      if (expanded === undefined) {
        return;
      }

      const column = this.wpTableColumns.findById(expanded)!;
      // Render the child relations
      workPackage.children.forEach((child) => {
        const target = this.states.workPackages.get(child.id as string).value as WorkPackageResource;
        // Build each relation row (currently sorted by order defined in API)
        const [relationRow, _] = this.relationRowBuilder.buildEmptyRelationRow(
          workPackage,
          target,
        );

        // Augment any data for the belonging work package row to it
        this.renderRelationRow(relationRow, row, this.label, column, workPackage, target, 'children');
      });
    });
  }

  public get isApplicable() {
    return this.wpTableColumns.hasChildRelationsColumn();
  }
}
