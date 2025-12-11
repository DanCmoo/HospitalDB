import { Module } from '@nestjs/common';
import { ReportesService } from './services/reportes.service';
import { PdfGeneratorService } from './services/pdf-generator.service';
import { ReportesController } from './controllers/reportes.controller';
import { PacientesModule } from '../pacientes/pacientes.module';
import { SedesModule } from '../sedes/sedes.module';
import { AgendaCitasModule } from '../agenda-citas/agenda-citas.module';
import { HistorialesModule } from '../historiales/historiales.module';
import { PrescripcionesModule } from '../prescripciones/prescripciones.module';
import { MedicamentosModule } from '../medicamentos/medicamentos.module';
import { EmpleadosModule } from '../empleados/empleados.module';
import { DepartamentosModule } from '../departamentos/departamentos.module';

@Module({
  imports: [
    PacientesModule,
    SedesModule,
    AgendaCitasModule,
    HistorialesModule,
    PrescripcionesModule,
    MedicamentosModule,
    EmpleadosModule,
    DepartamentosModule,
  ],
  controllers: [ReportesController],
  providers: [ReportesService, PdfGeneratorService],
  exports: [ReportesService],
})
export class ReportesModule {}
