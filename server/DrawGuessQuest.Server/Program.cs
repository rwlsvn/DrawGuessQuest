using DrawGuessQuest.Server.Hubs;
using DrawGuessQuest.Server.Interfaces;
using DrawGuessQuest.Server.Services;

var builder = WebApplication.CreateBuilder(args);
RegisterServices(builder.Services);

var app = builder.Build();
Configure(app);

app.Run();

void RegisterServices(IServiceCollection services)
{
    services.AddSignalR();
    services.AddCors(options =>
    {
        options.AddDefaultPolicy(builder =>
        {
            builder.WithOrigins("http://localhost:3000")
                .AllowAnyHeader()
                .AllowAnyMethod()
                .AllowCredentials();
        });
    });

    services.AddSingleton<IGameNotificationService, GameNotificationService>();
    services.AddSingleton<ILobbyService, LobbyService>();
}

void Configure(WebApplication app)
{
    app.UseCors();

    app.MapHub<GameHub>("/game");
}
