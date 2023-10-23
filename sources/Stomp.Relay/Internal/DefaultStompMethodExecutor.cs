
using System.Diagnostics;
using System.Reflection;
using System.Text.Encodings.Web;
using System.Text.Json;

using Microsoft.AspNetCore.Mvc;

using Microsoft.AspNetCore.Routing;
using Microsoft.AspNetCore.Routing.Template;
using Microsoft.Extensions.DependencyInjection;

using Microsoft.Extensions.Logging;

using Stomp.Relay.Config;

using Stomp.Relay.Internal;

namespace Stomp.Relay;

internal class DefaultStompMethodExecutor : IStompMethodExecutor
{
    private readonly ILogger<DefaultStompMethodExecutor> _logger;
    private readonly StompRelayConfig _config;
    private readonly IServiceScopeFactory _scopeFactory;

    private readonly Dictionary<string, StompControllerActionDescriptor> _methods = new(StringComparer.OrdinalIgnoreCase);

    public DefaultStompMethodExecutor(ILogger<DefaultStompMethodExecutor> logger, StompRelayConfig config, IServiceScopeFactory scopeFactory)
    {
        _logger = logger;
        _config = config;
        _scopeFactory = scopeFactory;

        GetStompControllers();
    }

    public async Task Execute(StompContext context)
    {
        _logger.LogDebug("Executing destination: {}", context.Destination);

        var descriptor = FindMatchingMethod(context);

        if (descriptor is not null)
        {
            try
            {
                var parameters = new List<object?>();
                foreach (var p in descriptor.MethodInfo.GetParameters())
                {
                    var fromRoute = p.GetCustomAttribute<FromRouteAttribute>(inherit: true);
                    var fromHeader = p.GetCustomAttribute<FromHeaderAttribute>(inherit: true);

                    if (fromRoute is not null)
                    {
                        var key = fromRoute.Name ?? p.Name!;
                        parameters.Add(context.PathParameters.ContainsKey(key) ? Convert.ChangeType(context.PathParameters[key], p.ParameterType) : null);
                    }
                    else if (fromHeader is not null)
                    {
                        var key = fromHeader.Name ?? p.Name!;
                        parameters.Add(context.StompMessage.Headers.ContainsKey(key) ? Convert.ChangeType(context.StompMessage.Headers[key].Value, p.ParameterType) : null);
                    }
                    else
                    {
                        // parameter from body
                        var value = JsonSerializer.Deserialize(context.StompMessage.Body, p.ParameterType, new JsonSerializerOptions {
                            PropertyNameCaseInsensitive = true
                        });
                        parameters.Add(value);
                    }
                }

                var isAwaitable = descriptor.MethodInfo.ReturnType.GetMethod(nameof(Task.GetAwaiter)) != null;
                if (isAwaitable)
                {
                    await DoExecuteAsync(descriptor, parameters: parameters.ToArray());
                }
                else
                {
                    DoExecute(descriptor, parameters: parameters.ToArray());
                }
            }
            catch (Exception e)
            {
                _logger.LogError("Error when executing method: {} {}", e.Source, e.Message);
            }
        }
        else
        {
            _logger.LogError("Method not exists for unknown route {}", context.Destination);
        }
    }

    private StompControllerActionDescriptor? FindMatchingMethod(StompContext context)
    {
        foreach (var kvp in _methods)
        {
            RouteValueDictionary? match = MatchTemplate(context, kvp.Key, context.Destination);
            if (match is not null)
            {
                foreach (var v in match)
                {
                    // store path parameter values
                    context.PathParameters.Add(v.Key, v.Value);
                }
                return kvp.Value;
            }
        }

        return null;
    }

    private void GetStompControllers()
    {
        // TODO: Replace static list of assemblies with a dynamic generator like .NOT does for controllers.
        var controllers = StompHandlerReflectionHelper.GetStompMethods(_config.SearchIn);
        foreach (var (controller, method) in controllers)
        {
            var template = method.GetCustomAttribute<StompRouteAttribute>();
            _methods.Add(template!.Template, new StompControllerActionDescriptor
            {
                ActionName = method.Name,
                ControllerName = controller.Name,
                ControllerTypeInfo = controller,
                MethodInfo = method,
            });
        }
    }

    private RouteValueDictionary? MatchTemplate(StompContext context, string routeTemplate, string requestPath)
    {
        var template = TemplateParser.Parse(routeTemplate);
        var matcher = new TemplateMatcher(template, GetDefaults(template));
        var values = new RouteValueDictionary();
        var match = matcher.TryMatch(requestPath, values);
        return match ? values : null;
    }

    private static RouteValueDictionary GetDefaults(RouteTemplate parsedTemplate)
    {
        var result = new RouteValueDictionary();

        foreach (var parameter in parsedTemplate.Parameters)
        {
            if (parameter.DefaultValue != null)
            {
                result.Add(parameter.Name!, parameter.DefaultValue);
            }
        }

        return result;
    }

    private async Task DoExecuteAsync(StompControllerActionDescriptor descriptor, object?[]? parameters)
    {
        using var scope = _scopeFactory.CreateScope();
        var call = ActivatorUtilities.CreateInstance(scope.ServiceProvider, descriptor.ControllerTypeInfo);

        await (Task)descriptor.MethodInfo.Invoke(call, parameters)!;
    }

    private void DoExecute(StompControllerActionDescriptor descriptor, object?[]? parameters)
    {
        using var scope = _scopeFactory.CreateScope();
        var call = ActivatorUtilities.CreateInstance(scope.ServiceProvider, descriptor.ControllerTypeInfo);

        descriptor.MethodInfo.Invoke(call, parameters);
    }
}