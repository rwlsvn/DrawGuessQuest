using DrawGuessQuest.Server.Models;

namespace DrawGuessQuest.Server.Interfaces
{
    public interface IGameNotificationService
    {
        Task PlayerJoinGameAsync(Player joinedPlayer, GameInfo gameInfo);
        Task PlayerLeftGameAsync(Guid gameId, Guid userId);
        Task DrawLineAsync(Guid gameId, string painterId, DrawnLine drawModel);
        Task ClearPainting(Guid gameId);
        Task NotifyWinAsync(Guid gameId, string username, string word);
        Task ReceiveMessageAsync(Guid gameId, string message, string username);
        Task NewTurnAsync(Guid gameId, Player painter, List<PlayerInfo> players);
        Task RoundStartAsync(Guid gameId, int wordLength);
    }
}
