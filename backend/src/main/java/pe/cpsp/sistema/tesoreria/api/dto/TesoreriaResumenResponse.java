package pe.cpsp.sistema.tesoreria.api.dto;

import java.math.BigDecimal;
import java.util.List;

public record TesoreriaResumenResponse(
    BigDecimal recaudacionDia,
    long operacionesDia,
    long pendientesUrgentes,
    long comprobantesEmitidos,
    long boletasNoImpresas,
    List<ResumenCanalResponse> canalesDia,
    List<ResumenCajaResponse> estadoCaja,
    List<OperacionTesoreriaResponse> ultimasOperaciones) {}
