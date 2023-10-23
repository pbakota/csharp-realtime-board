using System.Reflection;

namespace Stomp.Relay.Internal;

internal static class StompHandlerReflectionHelper
{
    public static IEnumerable<(TypeInfo, MethodInfo)> GetStompMethods(Assembly[] searchAssemblies)
    {
        List<(TypeInfo, MethodInfo)> result = new();
        foreach (var asm in searchAssemblies)
        {
            foreach (var type in asm.GetTypes().Where(type => type.GetCustomAttribute<StompControllerAttribute>(inherit: true) != null))
            {
                foreach (var method in type.GetMethods(BindingFlags.Instance | BindingFlags.DeclaredOnly | BindingFlags.Public))
                {
                    if (method.GetCustomAttribute<StompRouteAttribute>(inherit: true) is not null)
                    {
                        result.Add((type.GetTypeInfo(), method));
                    }
                }
            }
        }
        return result;
    }
}