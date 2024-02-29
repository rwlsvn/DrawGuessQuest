namespace DrawGuessQuest.Server.Models
{
    public class GameInfo
    {
        public Guid Id { get; set; }
        public Player Painter { get; set; }
        public List<DrawnLine> DrawnLines { get; set; }
        public List<PlayerInfo> Players { get; set; }
        public int RemainingTimeMilliseconds { get; set; }
        public int WordLength { get; set; }
    }
}
