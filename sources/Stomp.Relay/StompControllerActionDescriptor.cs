using System.Reflection;

using Microsoft.AspNetCore.Mvc.Abstractions;

namespace Stomp.Relay;

public class StompControllerActionDescriptor : ActionDescriptor
{
    public string ControllerName { get; set; } = null!;
    public virtual string ActionName { get; set; } = null!;
    public MethodInfo MethodInfo { get; set; } = null!;
    public TypeInfo ControllerTypeInfo { get; set; } = null!;
    public override string? DisplayName { get; set; }
}