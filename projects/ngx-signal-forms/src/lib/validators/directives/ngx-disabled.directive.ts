import {
    booleanAttribute,
    computed,
    Directive,
    HostAttributeToken,
    inject,
    input,
    OnInit,
} from "@angular/core";
import { NGX_DECLARATIVE_REGISTRY } from "../../core/tokens";

/** Declaratively disables a field by name within an NgxDeclarativeAdapter. */
@Directive({ selector: "[ngxDisabled]", standalone: true })
export class NgxDisabledDirective implements OnInit {
    private readonly registry = inject(NGX_DECLARATIVE_REGISTRY, {
        optional: true,
    });
    private readonly fieldName = inject(new HostAttributeToken("name"), {
        optional: true,
    });

    readonly ngxDisabled = input(true, { transform: booleanAttribute });

    ngOnInit(): void {
        if (!this.registry || !this.fieldName) return;
        this.registry.setDisabled(this.fieldName, computed(() => this.ngxDisabled()));
    }
}
