package pe.cpsp.sistema.common.exception;

import jakarta.servlet.http.HttpServletRequest;
import java.time.OffsetDateTime;
import java.util.List;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import pe.cpsp.sistema.common.api.ApiErrorResponse;

@RestControllerAdvice
public class GlobalExceptionHandler {

  @ExceptionHandler(ResourceNotFoundException.class)
  public ResponseEntity<ApiErrorResponse> handleNotFound(
      ResourceNotFoundException exception, HttpServletRequest request) {
    return buildResponse(
        HttpStatus.NOT_FOUND, exception.getMessage(), request.getRequestURI(), List.of());
  }

  @ExceptionHandler(DuplicateResourceException.class)
  public ResponseEntity<ApiErrorResponse> handleConflict(
      DuplicateResourceException exception, HttpServletRequest request) {
    return buildResponse(
        HttpStatus.CONFLICT, exception.getMessage(), request.getRequestURI(), List.of());
  }

  @ExceptionHandler(InvalidRequestException.class)
  public ResponseEntity<ApiErrorResponse> handleBadRequest(
      InvalidRequestException exception, HttpServletRequest request) {
    return buildResponse(
        HttpStatus.BAD_REQUEST, exception.getMessage(), request.getRequestURI(), List.of());
  }

  @ExceptionHandler(MethodArgumentNotValidException.class)
  public ResponseEntity<ApiErrorResponse> handleValidation(
      MethodArgumentNotValidException exception, HttpServletRequest request) {
    List<String> details =
        exception.getBindingResult().getFieldErrors().stream()
            .map(FieldError::getDefaultMessage)
            .toList();

    return buildResponse(
        HttpStatus.BAD_REQUEST,
        "La solicitud contiene datos invalidos.",
        request.getRequestURI(),
        details);
  }

  @ExceptionHandler(DataIntegrityViolationException.class)
  public ResponseEntity<ApiErrorResponse> handleDataIntegrity(
      DataIntegrityViolationException exception, HttpServletRequest request) {
    String message =
        exception.getMostSpecificCause() != null
                && exception.getMostSpecificCause().getMessage() != null
                && exception.getMostSpecificCause().getMessage().toLowerCase().contains("foto_url")
            ? "La foto es demasiado grande para guardarse. Usa una imagen mas ligera."
            : "No se pudo guardar la informacion enviada por una restriccion de datos.";

    return buildResponse(HttpStatus.BAD_REQUEST, message, request.getRequestURI(), List.of());
  }

  @ExceptionHandler(Exception.class)
  public ResponseEntity<ApiErrorResponse> handleUnexpected(
      Exception exception, HttpServletRequest request) {
    return buildResponse(
        HttpStatus.INTERNAL_SERVER_ERROR,
        "Ocurrio un error inesperado en el servidor.",
        request.getRequestURI(),
        List.of(exception.getClass().getSimpleName()));
  }

  private ResponseEntity<ApiErrorResponse> buildResponse(
      HttpStatus status, String message, String path, List<String> details) {
    ApiErrorResponse payload =
        new ApiErrorResponse(
            OffsetDateTime.now(), status.value(), status.getReasonPhrase(), message, path, details);

    return ResponseEntity.status(status).body(payload);
  }
}
