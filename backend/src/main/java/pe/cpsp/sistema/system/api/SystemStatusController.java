package pe.cpsp.sistema.system.api;

import java.time.OffsetDateTime;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.env.Environment;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/system")
public class SystemStatusController {

  private final Environment environment;

  @Value("${spring.application.name}")
  private String applicationName;

  public SystemStatusController(Environment environment) {
    this.environment = environment;
  }

  @GetMapping("/status")
  public SystemStatusResponse status() {
    return new SystemStatusResponse(
        applicationName,
        environment.getProperty("spring.profiles.active", "local"),
        "UP",
        OffsetDateTime.now());
  }

  public record SystemStatusResponse(
      String application, String profile, String status, OffsetDateTime timestamp) {}
}
