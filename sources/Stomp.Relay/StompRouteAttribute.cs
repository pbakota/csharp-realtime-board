namespace Stomp.Relay;

[AttributeUsage(AttributeTargets.Method, AllowMultiple = false, Inherited = true)]
public class StompRouteAttribute : Attribute
{
    public string Template { get; }

    public StompRouteAttribute(string name)
    {
        Template = name;
    }
}