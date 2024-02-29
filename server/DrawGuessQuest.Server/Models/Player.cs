namespace DrawGuessQuest.Server.Models
{
    public class Player
    {
        public Guid Id { get; set; }
        public string ConnectionId { get; set; }
        public string Username { get; set; }
        public int Score { get; set; } = 0;
    }
}
